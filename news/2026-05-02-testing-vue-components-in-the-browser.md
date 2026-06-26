---
title: Testing Vue components in the browser
url: 'https://jvns.ca/blog/2026/05/02/testing-vue-components-in-the-browser/'
url_hash: ed27db87506c124da7e152d84dadc96d6801c5a7
source: Julia Evans
source_url: 'https://jvns.ca/atom.xml'
date: 2026-05-02T00:00:00.000Z
lang: zh
translated: true
tags:
  - 前端
  - AI
original_lang: en
truncated: false
---
你好！我在这个平台上的一个长期项目是[研究如何在不使用 Node](https://jvns.ca/#javascript) 或其他服务器端 JS 运行时的情况下编写前端 JavaScript。

在前端 JS 项目中，我经常遇到的一个问题就是不知道如何为它们编写测试。过去我尝试过使用 Playwright，但总觉得每次都要启动新的浏览器进程既慢又笨重，而且还需要一些 Node 代码来协调测试。

结果就是，我干脆不测试前端代码了，这感觉并不好。通常我也不会频繁更新项目，所以这个问题不太突出，但如果能更自信地做出改动，那就太好了！因此，一种我喜欢的前端测试方式一直是我的心愿清单上的项目。

### 想法：直接在浏览器标签页中运行测试

Alex Chan 之前写过一篇很棒的文章，叫[在没有（第三方）框架的情况下测试 JavaScript](https://alexwlchan.net/2023/testing-javascript-without-a-framework/)，这是对我之前在这个系列中一篇关于如何编写一个在浏览器页面中运行的小型单元测试框架的文章的回应。

我当时很喜欢这篇文章，但它只讨论了单元测试，而我想为我的 Vue 组件编写端到端的集成测试，却不知道如何下手。

所以，前几天当我和 [Marco](https://bsky.app/profile/polotek.bsky.social) 聊天，他说了句“你知道吗，你完全可以在浏览器里直接运行 Vue 组件的测试”时，我想：“嘿，我应该再试试这个方法！！！”

我昨天才做完这一切，所以肯定还有很多改进空间，但我想在忘记之前记下一些过程中注意到的事情。

这对我来说有点棘手，因为 Vue 网站通常假设你在构建过程中以某种方式使用了 Node（有很多“第一步：`npm install THING`”这样的说明），而我不想用 Node/Deno 等工具。但事实证明，这并没有那么复杂。

我要讨论测试的项目是[我在 2023 年写的这个 zine 反馈网站](https://jvns.ca/blog/2023/03/31/zine-feedback-site/)。

### 测试框架：QUnit

我使用了 [QUnit](https://qunitjs.com/)。它用起来很棒，但关于它的工作原理我没什么特别要说的，所以就到此为止吧。我认为 Alex 的“自己编写测试框架”方法也同样可行。我按照[这些说明](https://qunitjs.com/browser/)进行了操作。

我很欣赏 QUnit 有一个“重新运行测试”按钮，可以只重新运行一个测试。因为我的测试中有很多网络请求，所以能够只运行一个测试，大大降低了调试测试的混乱程度。

### 第一步：为测试设置组件

我需要做的第一件事就是让我的 Vue 组件在测试环境中能够正常运行。

我将主应用改为将所有组件放在 `window._components` 中，大致如下：

```
const components = {
  'Feedback': FeedbackComponent,
  ...
}
window._components = components;
```

然后我编写了一个 `mountComponent` 函数，它的功能与普通主应用几乎完全相同（渲染一个包含所需组件的小模板）。唯一的区别是：

1.  我可以选择性地传入一些额外数据作为组件的 props。
2.  它会将组件挂载到一个临时的不可见 div 上，该 div 在测试结束后会从 DOM 中移除。这个 div 被定位在页面之外（`position: absolute; top: -10000, ...`），所以你看不到它。

以下是使用 `mountComponent` 函数的示例：

```
const {div} = mountComponent(
  '<Page :feedbacks="feedbacks" id=2 />',
  {feedbacks: [testFeedback]},
);
```

以及它的代码：

```
function mountComponent(template, data) {
  const app = Vue.createApp({
    template: template,
    data: () => data,
  })
  for (const [c, v] of Object.entries(window._components)) {
    app.component(c, v);
  }
  const div = document.getElementById('qunit-fixture')
             .appendChild(document.createElement('div'));
  return div;
}
```

结果是一个 div，我可以在其中通过编程方式点击、填写表单数据、检查是否正确显示内容等。

### 第二步：添加一些测试数据

由于我在编写端到端集成测试来确保客户端 JavaScript 与服务器正常协作，因此需要在数据库中有一些测试数据。于是我写了大约 25 行 SQL 来在数据库中设置一些测试数据，并在开发服务器上添加了一个端点，用于执行 SQL 将测试数据重置到已知状态。

```
async function reset() {
    return fetch('/api/reset_test_data', {method: "POST"})
}
```

然后我只需在需要测试数据的任何测试开始时运行 `await reset()`。

实际上，我的 `reset()` 函数并不总是完全重置所有内容，这有点糟糕，但一开始还能用，以后可以改进。

### 第三步：一个基本测试

下面是一个基本测试的样子！基本上我们渲染 div 并确保它包含一些大致正确的数据。

```
QUnit.test('renders feedback content', async function (assert) {
  const {div} = mountComponent(
    '<Page :feedbacks="feedbacks" id=2 image=2 page_hash=2 />',
    {feedbacks: [testFeedback]},
  );
  assert.ok(div.textContent.includes('loved this section'));
})
```

以上就是所有基本部分！下面是我在这个过程中遇到的一些问题。

### 等待页面部分内容渲染

我的测试中有很多网络请求，它们需要时间完成，Vue 代码也需要时间处理结果并更新 DOM。

我想我们很久以前就学到，在测试中随意添加 `sleep()` 调用并希望时间点正确，既慢又不稳定，而且非常令人沮丧，所以我需要另一种方法。

据我所知，处理这个问题的常规方法是找到一种方法，从 DOM 中判断是否可以继续操作。比如“如果这个按钮可见，我们就可以继续”。

所以我写了一个小小的 `waitFor()` 函数，每 20 毫秒轮询一次，检查某个条件是否已完成。如果 2 秒后仍未完成，则超时。

使用示例如下：

```
QUnit.test("click item", async function (assert) {
  const {div} = mountComponent(
    '<Feedback zine_id="test123" image_width="800px" />',
    {});
  const item = await waitFor(() => div.querySelector('.feedback-item'));
  item.click();
  // 测试的其余部分在这里...
})
```

看起来这个概念有很多实现，而且都比我的考虑得更周全。（快速搜索一下：[qunit-wait-for](https://www.npmjs.com/package/qunit-wait-for)、[playwright expect.poll](https://playwright.dev/docs/testing-library#replacing-waitfor)）

### 确定要等待的正确内容并不简单

在某些情况下，我*以为*自己已经确定了 DOM 中要等待的正确内容（“只要等这个 textarea 出现就行！”），但结果发现，由于程序内部的一些实现细节，实际上我需要等待后面某个更难确定的内容。

我最终修改了一个组件，在它完成某个重要操作时，向 DOM 中添加一个随机值（比如 `data-this-thing-is-ready=true`），这感觉并不太好。

我最好的猜测是，解决这类测试问题的正确方法是进行一次重构，同时让应用对用户来说更可靠：如果 DOM 中有一个元素实际上还没有准备好让用户交互，也许我根本就不应该显示它！

### 添加一些 CSS 类来标识元素（但这正确吗？）

我最终在 HTML 元素上添加了一些类，以便在测试中找到它们，要么是因为我需要点击它们，要么是需要等待它们出现在 DOM 中。

我以后可能会改变这种方法——前端测试框架似乎建议避免使用 CSS 类，而是使用类似 [getByRole](https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-role) 的方法，或者作为最后手段，使用类似 [data-testid](https://testing-library.com/docs/dom-testing-library/intro/) 的方法。感觉有一种方法可以同时让应用更易访问和更易测试。

### 填写表单很棘手

要填写表单，我不能仅仅设置 `value`，还需要触发一个事件来告诉 Vue 元素已经发生了变化。例如，`checkbox` 和 `textarea` 需要不同类型的事件。

```
textarea.value = 'banana banana banana';
textarea.dispatchEvent(new Event('input'));
```

```
checkbox.checked = true;
checkbox.dispatchEvent(new Event('change'));
```

这有点烦人，也让我意识到为什么我可能想使用某种 UI 测试库，例如：

-   Testing Library 的[填写表单示例](https://testing-library.com/docs/example-react-formik)看起来与我的做法截然不同
-   Vue Test Utils：他们关于[表单处理的部分](content/post/2026-05-02-testing-javascript-in-the-browser.markdown)看起来大大简化了这一点。

### 测试覆盖率

我想了解自己的测试覆盖率，结果发现 Chrome 其实内置了 JS 和 CSS 的[代码覆盖率](https://developer.chrome.com/docs/devtools/coverage)功能！

我的 JS 通过 esbuild 打包成一个名为 `bundle.js` 的文件，所以我只需查看 `bundle.js` 就能知道哪些行没有被覆盖。

这个过程有点麻烦：我必须在 Chrome 开发者工具中关闭 sourcemap 才能正常工作，而且需要按照一系列不太直观的特定步骤才能看到覆盖率数据。

### 这真是太有趣了！

和往常一样，我从未真正担任过前端或后端开发人员（除了为自己做项目！），感觉自己一直在学习如何完成这些超级基础的任务。

做这件事让我非常开心。我的前端项目总是因为未经测试而显得很脆弱，也许有一天我会拥有一个让自己充满信心的测试套件！

我仍在思考的一些事情：

-   在写这篇文章时，我发现了一个名为 [Testing Library](https://testing-library.com/) 的前端测试库，它提供了许多与我最初想法截然不同的测试编写指南。我尝试将所有内容重写为使用 Testing Library，感觉相当不错，我们拭目以待。他们提供了一个无需 Node 即可运行的 `.umd.js` 文件。
-   我还不确定自己是否接受完全没有办法在命令行运行这些测试。也许有一种简单的方法可以主要在浏览器中工作，但如果需要的话，也能在 CI 中运行它们？
