---
title: Implementing A Byte Pair Encoding (BPE) Tokenizer From Scratch
url: 'https://sebastianraschka.com/blog/2025/bpe-from-scratch.html'
url_hash: d4f422f3dedc87affdc9fae36464dbe562b28e54
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2025-01-17T06:03:00.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
-   这是一个独立的笔记本，出于教育目的，从头实现了流行的[字节对编码 (BPE)](https://sebastianraschka.com/glossary/#bpe "Byte Pair Encoding (BPE)") 分词算法，该算法用于 GPT-2 到 GPT-4、Llama 3 等模型中。
-   关于分词目的的更多细节，请参考[第 2 章](https://github.com/rasbt/LLMs-from-scratch/blob/main/ch02/01_main-chapter-code/ch02.ipynb)；此处的代码是解释 BPE 算法的补充材料。
-   OpenAI 为训练原始 GPT 模型而实现的原始 BPE 分词器可以在[此处](https://github.com/openai/gpt-2/blob/master/src/encoder.py)找到。
-   BPE 算法最初于 1994 年由 Philip Gage 在“[一种新的数据压缩算法](http://www.pennelynn.com/Documents/CUJ/HTML/94HTML/19940045.HTM)”中描述。
-   如今，包括 Llama 3 在内的大多数项目都使用 OpenAI 的开源 [tiktoken 库](https://github.com/openai/tiktoken)，因为它具有计算性能优势；例如，它允许加载预训练的 GPT-2 和 GPT-4 分词器（Llama 3 模型也使用 GPT-4 分词器进行训练）。
-   除了上述实现之外，我的这个笔记本中的实现与它们的区别在于，它还包含一个用于训练分词器的函数（出于教育目的）。
-   还有一个名为 [minBPE](https://github.com/karpathy/minbpe) 的实现，它也支持训练，可能性能更好（我这里的实现侧重于教育目的）；与 `minbpe` 相比，我的实现还额外允许加载原始的 OpenAI 分词器词汇表和 BPE“合并”（此外，Hugging Face 分词器也能够训练和加载各种分词器；有关更多信息，请参阅一位读者在尼泊尔语上训练 BPE 分词器的 [GitHub 讨论](https://github.com/rasbt/LLMs-from-scratch/discussions/485)）。

**代码**

一个独立的代码笔记本可以在[此处](https://github.com/rasbt/LLMs-from-scratch/blob/main/ch02/05_bpe-from-scratch/bpe-from-scratch.ipynb)找到。

## 1\. 字节对编码 (BPE) 背后的主要思想 [](#1-the-main-idea-behind-byte-pair-encoding-bpe)

-   BPE 的主要思想是将文本转换为整数表示（token ID），用于 LLM 训练（参见[第 2 章](https://github.com/rasbt/LLMs-from-scratch/blob/main/ch02/01_main-chapter-code/ch02.ipynb)）。

![说明字节对编码 token 合并的概览图](https://sebastianraschka.com/images/LLMs-from-scratch-images/bonus/bpe-from-scratch/bpe-overview.webp)

### 1.1 比特和字节 [](#11-bits-and-bytes)

-   在介绍 BPE 算法之前，我们先引入字节的概念。
-   考虑将文本转换为字节数组（毕竟 BPE 代表“字节”对编码）：

```
text = "This is some text"
byte_ary = bytearray(text, "utf-8")
print(byte_ary)
```

```
bytearray(b'This is some text')
```

-   当我们对 `bytearray` 对象调用 `list()` 时，每个字节都被视为一个单独的元素，结果是一个对应于字节值的整数列表：

```
ids = list(byte_ary)
print(ids)
```

```
[84, 104, 105, 115, 32, 105, 115, 32, 115, 111, 109, 101, 32, 116, 101, 120, 116]
```

-   这将是一种将文本转换为 LLM [嵌入层](https://sebastianraschka.com/glossary/#token-embeddings "Token Embeddings")所需的 token ID 表示的有效方法。
-   然而，这种方法的缺点是它为每个字符创建一个 ID（对于短文本来说，ID 数量很多！）。
-   也就是说，对于一个 17 个字符的输入文本，我们必须使用 17 个 token ID 作为 LLM 的输入：

```
print("Number of characters:", len(text))
print("Number of token IDs:", len(ids))
```

```
Number of characters: 17
Number of token IDs: 17
```

-   如果你之前使用过大型语言模型（LLM），你可能知道 BPE 分词器有一个词汇表，其中包含的是完整单词或子词的 token ID，而不是每个字符的 token ID  
-   例如，GPT-2 分词器将相同的文本（“This is some text”）仅分词为 4 个 token，而不是 17 个：`1212, 318, 617, 2420`  
-   你可以通过交互式 [tiktoken 应用](https://tiktokenizer.vercel.app/?model=gpt2) 或 [tiktoken 库](https://github.com/openai/tiktoken) 来验证这一点：

![Tiktokenizer 应用截图，显示 GPT-2 分词结果](https://sebastianraschka.com/images/LLMs-from-scratch-images/bonus/bpe-from-scratch/tiktokenizer.webp)

```
import tiktoken

gpt2_tokenizer = tiktoken.get_encoding("gpt2")
gpt2_tokenizer.encode("This is some text")
# 输出 [1212, 318, 617, 2420]
```

-   由于一个字节由 8 位组成，因此一个字节可以表示 28 = 256 个可能的值，范围从 0 到 255  
-   你可以通过执行代码 `bytearray(range(0, 257))` 来确认这一点，它会警告你 `ValueError: byte must be in range(0, 256)`  
-   BPE 分词器通常使用这 256 个值作为其前 256 个单字符 token；你可以通过运行以下代码直观地检查这一点：

```
import tiktoken
gpt2_tokenizer = tiktoken.get_encoding("gpt2")

for i in range(300):
    decoded = gpt2_tokenizer.decode([i])
    print(f"{i}: {decoded}")
"""
输出：
0: !
1: "
2: #
...
255: �  # <---- 到此为止是单字符 token
256:  t
257:  a
...
298: ent
299:  n
"""
```

-   上面，请注意条目 256 和 257 不是单字符值，而是双字符值（一个空格加一个字母），这是原始 GPT-2 BPE 分词器的一个小缺点（在 GPT-4 分词器中已得到改进）

### 1.2 构建词汇表[](#12-building-the-vocabulary)

-   BPE 分词算法的目标是构建一个包含常见子词的词汇表，例如 `298: ent`（可以在 *entangle、entertain、enter、entrance、entity* 等单词中找到），甚至是完整的单词，例如

```
318: is
617: some
1212: This
2420: text
```

-   BPE 算法最初于 1994 年由 Philip Gage 在论文 “[A New Algorithm for Data Compression](http://www.pennelynn.com/Documents/CUJ/HTML/94HTML/19940045.HTM)” 中描述  
-   在我们进入实际代码实现之前，如今用于 LLM 分词器的形式可以概括为以下各节所述。

### 1.3 BPE 算法概述[](#13-bpe-algorithm-outline)

**1\. 识别频繁对**

-   在每次迭代中，扫描文本以找到最常出现的字节（或字符）对

**2\. 替换并记录**

-   用一个新的占位符 ID（尚未使用的 ID，例如，如果我们从 0…255 开始，第一个占位符将是 256）替换该对  
-   在查找表中记录此映射  
-   查找表的大小是一个超参数，也称为“[词汇表大小](https://sebastianraschka.com/glossary/#vocabulary-size "词汇表大小")”（对于 GPT-2，大小为 50,257）

**3\. 重复直到没有收益**

-   不断重复步骤 1 和 2，持续合并最频繁的对  
-   当无法进一步压缩时停止（例如，没有一对出现超过一次）

**解压缩（解码）**

-   要恢复原始文本，通过使用查找表将每个 ID 替换为其对应的对来逆转该过程

### 1.4 BPE 算法示例[](#14-bpe-algorithm-example)

#### 1.4.1 编码部分的具体示例（第1.3节中的步骤1和2）[](#141-concrete-example-of-the-encoding-part-steps-1--2-in-section-13)

-   假设我们有一段文本（训练数据集）`the cat in the hat`，我们希望从中构建BPE分词器的词汇表

**迭代1**

1.  识别频繁出现的相邻对
    -   在这段文本中，“th”出现了两次（一次在开头，一次在第二个“e”之前）
2.  替换并记录
    -   将“th”替换为一个尚未使用的新token ID，例如256
    -   新文本为：`<256>e cat in <256>e hat`
    -   新词汇表为

**迭代2**

1.  **识别频繁出现的相邻对**
    -   在文本`<256>e cat in <256>e hat`中，相邻对`<256>e`出现了两次
2.  **替换并记录**
    -   将`<256>e`替换为一个尚未使用的新token ID，例如`257`
    -   新文本为：
    -   更新后的词汇表为：

```
        0: ...
        ...
        256: "th"
        257: "<256>e"
        ```

**迭代3**

1.  **识别频繁出现的相邻对**
    -   在文本`<257> cat in <257> hat`中，相邻对`<257>`出现了两次（一次在开头，一次在“hat”之前）
2.  **替换并记录**
    -   将`<257>`替换为一个尚未使用的新token ID，例如`258`
    -   新文本为：
    -   更新后的词汇表为：

```
        0: ...
        ...
        256: "th"
        257: "<256>e"
        258: "<257> "
        ```

-   以此类推

#### 1.4.2 解码部分的具体示例（第1.3节中的步骤3）[](#142-concrete-example-of-the-decoding-part-step-3-in-section-13)

-   要恢复原始文本，我们反向执行该过程，按照引入的相反顺序将每个token ID替换为其对应的相邻对
-   从最终的压缩文本开始：`<258>cat in <258>hat`
-   替换`<258>` → `<257>` ：`<257> cat in <257> hat`
-   替换`<257>` → `<256>e`：`<256>e cat in <256>e hat`
-   替换`<256>` → “th”：`the cat in the hat`

### 2\. 一个简单的BPE实现[](#2-a-simple-bpe-implementation)

-   下面是一个用Python类实现的上述算法，它模仿了`tiktoken`的Python用户接口
-   请注意，上述编码部分通过`train()`描述了原始的训练步骤；然而，`encode()`方法的工作方式类似（尽管由于特殊token的处理，它看起来稍微复杂一些）：

1.  将输入文本拆分为单个字节
2.  反复查找并替换（合并）相邻的token（相邻对），当它们与已学习的BPE合并规则中的任何相邻对匹配时（按从最高到最低的“等级”，即按学习顺序）
3.  继续合并，直到无法再进行合并
4.  最终的token ID列表即为编码输出

```
from collections import Counter, deque
from functools import lru_cache
import json

class BPETokenizerSimple:
    def __init__(self):
        # 将token_id映射到token_str（例如，{11246: "some"}）
        self.vocab = {}
        # 将token_str映射到token_id（例如，{"some": 11246}）
        self.inverse_vocab = {}
        # BPE合并字典：{(token_id1, token_id2): merged_token_id}
        self.bpe_merges = {}
```

# 对于官方 OpenAI GPT-2 合并，使用一个排名字典：
        # 格式为 {(string_A, string_B): rank}，其中 rank 越低表示优先级越高
        self.bpe_ranks = {}

def train(self, text, vocab_size, allowed_special={"<|endoftext|>"}):
        """
        从头开始训练 BPE 分词器。

参数：
            text (str)：训练文本。
            vocab_size (int)：期望的词汇表大小。
            allowed_special (set)：要包含的特殊标记集合。
        """

# 预处理：将空格替换为 "Ġ"
        # 注意 Ġ 是 GPT-2 BPE 实现的一个特性
        # 例如，"Hello world" 可能被分词为 ["Hello", "Ġworld"]
        # （GPT-4 BPE 会将其分词为 ["Hello", " world"]）
        processed_text = []
        for i, char in enumerate(text):
            if char == " " and i != 0:
                processed_text.append("Ġ")
            if char != " ":
                processed_text.append(char)
        processed_text = "".join(processed_text)

# 用唯一字符初始化词汇表，包括 "Ġ"（如果存在）
        # 从前 256 个 ASCII 字符开始
        unique_chars = [chr(i) for i in range(256)]
        unique_chars.extend(
            char for char in sorted(set(processed_text))
            if char not in unique_chars
        )
        if "Ġ" not in unique_chars:
            unique_chars.append("Ġ")

self.vocab = {i: char for i, char in enumerate(unique_chars)}
        self.inverse_vocab = {char: i for i, char in self.vocab.items()}

# 添加允许的特殊标记
        if allowed_special:
            for token in allowed_special:
                if token not in self.inverse_vocab:
                    new_id = len(self.vocab)
                    self.vocab[new_id] = token
                    self.inverse_vocab[token] = new_id

# 将处理后的文本分词为标记 ID
        token_ids = [self.inverse_vocab[char] for char in processed_text]

# BPE 步骤 1-3：重复查找并替换频繁出现的对
        for new_id in range(len(self.vocab), vocab_size):
            pair_id = self.find_freq_pair(token_ids, mode="most")
            if pair_id is None:
                break
            token_ids = self.replace_pair(token_ids, pair_id, new_id)
            self.bpe_merges[pair_id] = new_id

# 用合并后的标记构建词汇表
        for (p0, p1), new_id in self.bpe_merges.items():
            merged_token = self.vocab[p0] + self.vocab[p1]
            self.vocab[new_id] = merged_token
            self.inverse_vocab[merged_token] = new_id

def load_vocab_and_merges_from_openai(self, vocab_path, bpe_merges_path):
        """
        从 OpenAI 的 GPT-2 文件加载预训练的词汇表和 BPE 合并。

参数：
            vocab_path (str)：词汇表文件的路径（GPT-2 称之为 'encoder.json'）。
            bpe_merges_path (str)：BPE 合并文件的路径（GPT-2 称之为 'vocab.bpe'）。
        """
        # 加载词汇表
        with open(vocab_path, "r", encoding="utf-8") as file:
            loaded_vocab = json.load(file)
            # 将加载的词汇表转换为正确格式
            self.vocab = {int(v): k for k, v in loaded_vocab.items()}
            self.inverse_vocab = {k: int(v) for k, v in loaded_vocab.items()}

# 处理换行符而不添加新标记
        if "\n" not in self.inverse_vocab:
            # 使用现有标记 ID 作为 '\n' 的占位符
            # 优先使用 "<|endoftext|>"（如果可用）
            fallback_token = next((token for token in ["<|endoftext|>", "Ġ", ""] if token in self.inverse_vocab), None)
            if fallback_token is not None:
                newline_token_id = self.inverse_vocab[fallback_token]
            else:
                # 如果没有可用的回退标记，则抛出错误
                raise KeyError("词汇表中没有合适的标记可用于映射 '\\n'。")

self.inverse_vocab["\n"] = newline_token_id
            self.vocab[newline_token_id] = "\n"

# 加载 GPT-2 合并并分配 "排名"
        self.bpe_ranks = {}  # 重置排名
        with open(bpe_merges_path, "r", encoding="utf-8") as file:
            lines = file.readlines()
            if lines and lines[0].startswith("#"):
                lines = lines[1:]

rank = 0
            for line in lines:
                pair = tuple(line.strip().split())
                if len(pair) == 2:
                    token1, token2 = pair
                    # 如果 token1 或 token2 不在词汇表中，则跳过
                    if token1 in self.inverse_vocab and token2 in self.inverse_vocab:
                        self.bpe_ranks[(token1, token2)] = rank
                        rank += 1
                    else:
                        print(f"跳过配对 {pair}，因为其中一个 token 不在词汇表中。")

def encode(self, text, allowed_special=None):
        """
        将输入文本编码为 token ID 列表，采用 tiktoken 风格的特殊 token 处理。

参数：
            text (str)：要编码的输入文本。
            allowed_special (set 或 None)：允许通过的特殊 token。如果为 None，则禁用特殊处理。

返回：
            token ID 列表。
        """
        import re

token_ids = []

# 如果启用了特殊 token 处理
        if allowed_special is not None and len(allowed_special) > 0:
            # 构建正则表达式以匹配允许的特殊 token
            special_pattern = (
                "(" + "|".join(re.escape(tok) for tok in sorted(allowed_special, key=len, reverse=True)) + ")"
            )

last_index = 0
            for match in re.finditer(special_pattern, text):
                prefix = text[last_index:match.start()]
                token_ids.extend(self.encode(prefix, allowed_special=None))  # 对前缀进行编码，不启用特殊处理

special_token = match.group(0)
                if special_token in self.inverse_vocab:
                    token_ids.append(self.inverse_vocab[special_token])
                else:
                    raise ValueError(f"特殊 token {special_token} 未在词汇表中找到。")
                last_index = match.end()

text = text[last_index:]  # 剩余部分正常处理

# 检查剩余部分中是否存在不允许的特殊 token
            disallowed = [
                tok for tok in self.inverse_vocab
                if tok.startswith("<|") and tok.endswith("|>") and tok in text and tok not in allowed_special
            ]
            if disallowed:
                raise ValueError(f"文本中遇到了不允许的特殊 token：{disallowed}")

# 如果没有特殊 token，或特殊 token 分割后的剩余文本：
        tokens = []
        lines = text.split("\n")
        for i, line in enumerate(lines):
            if i > 0:
                tokens.append("\n")
            words = line.split()
            for j, word in enumerate(words):
                if j == 0 and i > 0:
                    tokens.append("Ġ" + word)
                elif j == 0:
                    tokens.append(word)
                else:
                    tokens.append("Ġ" + word)

for token in tokens:
            if token in self.inverse_vocab:
                token_ids.append(self.inverse_vocab[token])
            else:
                token_ids.extend(self.tokenize_with_bpe(token))

return token_ids

def tokenize_with_bpe(self, token):
        """
        使用 BPE 合并对单个 token 进行分词。

参数：
            token (str)：要分词的 token。

返回：
            List[int]：应用 BPE 后的 token ID 列表。
        """
        # 将 token 分词为单个字符（作为初始 token ID）
        token_ids = [self.inverse_vocab.get(char, None) for char in token]
        if None in token_ids:
            missing_chars = [char for char, tid in zip(token, token_ids) if tid is None]
            raise ValueError(f"词汇表中未找到字符：{missing_chars}")

# 如果尚未加载 OpenAI 的 GPT-2 合并，则使用我的方法
        if not self.bpe_ranks:
            can_merge = True
            while can_merge and len(token_ids) > 1:
                can_merge = False
                new_tokens = []
                i = 0
                while i < len(token_ids) - 1:
                    pair = (token_ids[i], token_ids[i + 1])
                    if pair in self.bpe_merges:
                        merged_token_id = self.bpe_merges[pair]
                        new_tokens.append(merged_token_id)
                        # 为教学目的取消注释：
                        # print(f"合并配对 {pair} -> {merged_token_id} ('{self.vocab[merged_token_id]}')")
                        i += 2  # 跳过下一个 token，因为它已被合并
                        can_merge = True
                    else:
                        new_tokens.append(token_ids[i])
                        i += 1
                if i < len(token_ids):
                    new_tokens.append(token_ids[i])
                token_ids = new_tokens
            return token_ids

# 否则，使用排名进行 GPT-2 风格的合并：
        # 1) 将 token_ids 转换回每个 ID 的字符串 "symbols"
        symbols = [self.vocab[id_num] for id_num in token_ids]

# 反复合并所有出现的最低排名对
        while True:
            # 收集所有相邻对
            pairs = set(zip(symbols, symbols[1:]))
            if not pairs:
                break

# 找到排名最佳（最低）的对
            min_rank = float("inf")
            bigram = None
            for p in pairs:
                r = self.bpe_ranks.get(p, float("inf"))
                if r < min_rank:
                    min_rank = r
                    bigram = p

# 如果没有有效的排名对，则完成
            if bigram is None or bigram not in self.bpe_ranks:
                break

# 合并该对的所有出现
            first, second = bigram
            new_symbols = []
            i = 0
            while i < len(symbols):
                # 如果在位置 i 看到 (first, second)，则合并它们
                if i < len(symbols) - 1 and symbols[i] == first and symbols[i+1] == second:
                    new_symbols.append(first + second)  # 合并后的符号
                    i += 2
                else:
                    new_symbols.append(symbols[i])
                    i += 1
            symbols = new_symbols

if len(symbols) == 1:
                break

# 最后，将合并后的符号转换回 ID
        merged_ids = [self.inverse_vocab[sym] for sym in symbols]
        return merged_ids

def decode(self, token_ids):
        """
        将 token ID 列表解码回字符串。

参数：
            token_ids (List[int])：要解码的 token ID 列表。

返回：
            str：解码后的字符串。
        """
        decoded_string = ""
        for i, token_id in enumerate(token_ids):
            if token_id not in self.vocab:
                raise ValueError(f"Token ID {token_id} 未在词汇表中找到。")
            token = self.vocab[token_id]
            if token == "\n":
                if decoded_string and not decoded_string.endswith(" "):
                    decoded_string += " "  # 如果换行前没有空格，则添加空格
                decoded_string += token
            elif token.startswith("Ġ"):
                decoded_string += " " + token[1:]
            else:
                decoded_string += token
        return decoded_string

def save_vocab_and_merges(self, vocab_path, bpe_merges_path):
        """
        将词汇表和 BPE 合并规则保存到 JSON 文件。

参数：
            vocab_path (str)：保存词汇表的路径。
            bpe_merges_path (str)：保存 BPE 合并规则的路径。
        """
        # 保存词汇表
        with open(vocab_path, "w", encoding="utf-8") as file:
            json.dump(self.vocab, file, ensure_ascii=False, indent=2)

# 将 BPE 合并规则保存为字典列表
        with open(bpe_merges_path, "w", encoding="utf-8") as file:
            merges_list = [{"pair": list(pair), "new_id": new_id}
                           for pair, new_id in self.bpe_merges.items()]
            json.dump(merges_list, file, ensure_ascii=False, indent=2)

def load_vocab_and_merges(self, vocab_path, bpe_merges_path):
        """
        从 JSON 文件加载词汇表和 BPE 合并规则。

参数：
            vocab_path (str)：词汇表文件的路径。
            bpe_merges_path (str)：BPE 合并规则文件的路径。
        """
        # 加载词汇表
        with open(vocab_path, "r", encoding="utf-8") as file:
            loaded_vocab = json.load(file)
            self.vocab = {int(k): v for k, v in loaded_vocab.items()}
            self.inverse_vocab = {v: int(k) for k, v in loaded_vocab.items()}

# 加载 BPE 合并规则
        with open(bpe_merges_path, "r", encoding="utf-8") as file:
            merges_list = json.load(file)
            for merge in merges_list:
                pair = tuple(merge["pair"])
                new_id = merge["new_id"]
                self.bpe_merges[pair] = new_id

@lru_cache(maxsize=None)
    def get_special_token_id(self, token):
        return self.inverse_vocab.get(token, None)

@staticmethod
    def find_freq_pair(token_ids, mode="most"):
        pairs = Counter(zip(token_ids, token_ids[1:]))

if not pairs:
            return None

if mode == "most":
            return max(pairs.items(), key=lambda x: x[1])[0]
        elif mode == "least":
            return min(pairs.items(), key=lambda x: x[1])[0]
        else:
            raise ValueError("无效模式。请选择 'most' 或 'least'。")

@staticmethod
    def replace_pair(token_ids, pair_id, new_id):
        dq = deque(token_ids)
        replaced = []

while dq:
            current = dq.popleft()
            if dq and (current, dq[0]) == pair_id:
                replaced.append(new_id)
                # 移除配对中的第二个token，第一个已被移除
                dq.popleft()
            else:
                replaced.append(current)

return replaced
```

-   上述 `BPETokenizerSimple` 类中有大量代码，详细讨论已超出本笔记本的范围，但下一节将简要介绍其用法，以便更好地理解类方法

### 3\. BPE实现详解[](#3-bpe-implementation-walkthrough)

-   在实践中，我强烈推荐使用 [tiktoken](https://github.com/openai/tiktoken)，因为我的上述实现侧重于可读性和教学目的，而非性能
-   不过，其用法与 tiktoken 大致相似，只是 tiktoken 没有训练方法
-   让我们通过下面的示例来看看我的 `BPETokenizerSimple` Python 代码是如何工作的（详细的代码讨论已超出本笔记本的范围）

#### 3.1 训练、编码和解码[](#31-training-encoding-and-decoding)

-   首先，让我们考虑一些示例文本作为训练数据集：

```
import os
import urllib.request

def download_file_if_absent(url, filename, search_dirs):
    for directory in search_dirs:
        file_path = os.path.join(directory, filename)
        if os.path.exists(file_path):
            print(f"{filename} 已存在于 {file_path}")
            return file_path

target_path = os.path.join(search_dirs[0], filename)
    try:
        with urllib.request.urlopen(url) as response, open(target_path, "wb") as out_file:
            out_file.write(response.read())
        print(f"已下载 {filename} 到 {target_path}")
    except Exception as e:
        print(f"下载 {filename} 失败。错误: {e}")
    return target_path

verdict_path = download_file_if_absent(
    url=(
         "https://raw.githubusercontent.com/rasbt/"
         "LLMs-from-scratch/main/ch02/01_main-chapter-code/"
         "the-verdict.txt"
    ),
    filename="the-verdict.txt",
    search_dirs=["ch02/01_main-chapter-code/", "../01_main-chapter-code/", "."]
)

with open(verdict_path, "r", encoding="utf-8") as f: # 添加了 ../01_main-chapter-code/
    text = f.read()
```

```
the-verdict.txt 已存在于 ../01_main-chapter-code/the-verdict.txt
```

-   接下来，让我们初始化并训练一个词汇量为 1,000 的 BPE 分词器
-   请注意，由于前面讨论的字节值，默认词汇量已经是 256，因此我们实际上只“学习”了 744 个词汇条目（如果考虑 `<|endoftext|>` 特殊标记和 `Ġ` 空格标记，那么准确来说是 742 个）
-   作为对比，GPT-2 的词汇量为 50,257 个标记，GPT-4 的词汇量为 100,256 个标记（tiktoken 中的 `cl100k_base`），而 GPT-4o 使用 199,997 个标记（tiktoken 中的 `o200k_base`）；它们都有比我们上面简单示例文本大得多的训练集

```
tokenizer = BPETokenizerSimple()
tokenizer.train(text, vocab_size=1000, allowed_special={"<|endoftext|>"})
```

-   你可能想检查词汇表的内容（但请注意，这会生成一个很长的列表）

```
# print(tokenizer.vocab)
print(len(tokenizer.vocab))
```

-   这个词汇表是通过 742 次合并创建的（`= 1000 - len(range(0, 256)) - len(special_tokens) - "Ġ" = 1000 - 256 - 1 - 1 = 742`）

```
print(len(tokenizer.bpe_merges))
```

-   这意味着前 256 个条目是单字符标记

-   接下来，让我们使用 `encode` 方法通过创建的合并来编码一些文本：

```
input_text = "Jack embraced beauty through art and life."
token_ids = tokenizer.encode(input_text)
print(token_ids)
```

```
[424, 256, 654, 531, 302, 311, 256, 296, 97, 465, 121, 595, 841, 116, 287, 466, 256, 326, 972, 46]
```

```
input_text = "Jack embraced beauty through art and life.<|endoftext|> "
token_ids = tokenizer.encode(input_text)
print(token_ids)
```

```
[424, 256, 654, 531, 302, 311, 256, 296, 97, 465, 121, 595, 841, 116, 287, 466, 256, 326, 972, 46, 60, 124, 271, 683, 102, 116, 461, 116, 124, 62]
```

```
input_text = "Jack embraced beauty through art and life.<|endoftext|> "
token_ids = tokenizer.encode(input_text, allowed_special={"<|endoftext|>"})
print(token_ids)
```

```
[424, 256, 654, 531, 302, 311, 256, 296, 97, 465, 121, 595, 841, 116, 287, 466, 256, 326, 972, 46, 257]
```

```
print("字符数:", len(input_text))
print("令牌ID数:", len(token_ids))
```

```
字符数: 56
令牌ID数: 21
```

-   从上述长度可以看出，一个42字符的句子被编码为20个令牌ID，与基于字符字节的编码相比，输入长度大约减少了一半

-   注意，词汇表本身被用于`decode()`方法，该方法允许我们将令牌ID映射回文本：

```
[424, 256, 654, 531, 302, 311, 256, 296, 97, 465, 121, 595, 841, 116, 287, 466, 256, 326, 972, 46, 257]
```

```
print(tokenizer.decode(token_ids))
```

```
Jack embraced beauty through art and life.<|endoftext|>
```

-   遍历每个令牌ID可以让我们更好地理解令牌ID如何通过词汇表解码：

```
for token_id in token_ids:
    print(f"{token_id} -> {tokenizer.decode([token_id])}")
```

```
424 -> Jack
256 ->
654 -> em
531 -> br
302 -> ac
311 -> ed
256 ->
296 -> be
97 -> a
465 -> ut
121 -> y
595 ->  through
841 ->  ar
116 -> t
287 ->  a
466 -> nd
256 ->
326 -> li
972 -> fe
46 -> .
257 -> <|endoftext|>
```

-   如我们所见，大多数令牌ID代表2字符的子词；这是因为训练数据文本非常短，重复词汇不多，并且我们使用了相对较小的词汇表大小

-   总结来说，调用`decode(encode())`应该能够重现任意输入文本：

```
tokenizer.decode(
    tokenizer.encode("This is some text.")
)
```

```
tokenizer.decode(
    tokenizer.encode("This is some text with \n newline characters.")
)
```

```
'This is some text with \n newline characters.'
```

#### 3.2 保存和加载分词器[](#32-saving-and-loading-the-tokenizer)

-   接下来，我们看看如何保存训练好的分词器以便后续重用：

```
# 保存训练好的分词器
tokenizer.save_vocab_and_merges(vocab_path="vocab.json", bpe_merges_path="bpe_merges.txt")
```

```
# 加载分词器
tokenizer2 = BPETokenizerSimple()
tokenizer2.load_vocab_and_merges(vocab_path="vocab.json", bpe_merges_path="bpe_merges.txt")
```

-   加载后的分词器应能产生与之前相同的结果：

```
print(tokenizer2.decode(token_ids))
```

```
Jack embraced beauty through art and life.<|endoftext|>
```

```
tokenizer2.decode(
    tokenizer2.encode("This is some text with \n newline characters.")
)
```

```
'This is some text with \n newline characters.'
```

#### 3.3 加载OpenAI的原始GPT-2 BPE分词器[](#33-loading-the-original-gpt-2-bpe-tokenizer-from-openai)

-   最后，让我们加载OpenAI的GPT-2分词器文件

```
# 如果当前目录中不存在文件，则下载

# 定义要搜索的目录和要下载的文件
search_directories = ["ch02/02_bonus_bytepair-encoder/gpt2_model/", "../02_bonus_bytepair-encoder/gpt2_model/", "."]

files_to_download = {
    "https://openaipublic.blob.core.windows.net/gpt-2/models/124M/vocab.bpe": "vocab.bpe",
    "https://openaipublic.blob.core.windows.net/gpt-2/models/124M/encoder.json": "encoder.json"
}

# 确保目录存在并按需下载文件
paths = {}
for url, filename in files_to_download.items():
    paths[filename] = download_file_if_absent(url, filename, search_directories)
```

```
vocab.bpe 已存在于 ../02_bonus_bytepair-encoder/gpt2_model/vocab.bpe
encoder.json 已存在于 ../02_bonus_bytepair-encoder/gpt2_model/encoder.json
```

-   接下来，我们通过 `load_vocab_and_merges_from_openai` 方法加载文件：

```
tokenizer_gpt2 = BPETokenizerSimple()
tokenizer_gpt2.load_vocab_and_merges_from_openai(
    vocab_path=paths["encoder.json"], bpe_merges_path=paths["vocab.bpe"]
)
```

-   词汇表大小应为 `50257`，我们可以通过以下代码确认：

```
len(tokenizer_gpt2.vocab)
```

-   现在我们可以通过 `BPETokenizerSimple` 对象使用 GPT-2 分词器：

```
input_text = "This is some text"
token_ids = tokenizer_gpt2.encode(input_text)
print(token_ids)
```

```
print(tokenizer_gpt2.decode(token_ids))
```

-   你可以使用交互式 [tiktoken 应用](https://tiktokenizer.vercel.app/?model=gpt2) 或 [tiktoken 库](https://github.com/openai/tiktoken) 双重验证这是否产生正确的 token：

![Tiktokenizer 应用截图，显示 GPT-2 分词结果](https://sebastianraschka.com/images/LLMs-from-scratch-images/bonus/bpe-from-scratch/tiktokenizer.webp)

```
import tiktoken

gpt2_tokenizer = tiktoken.get_encoding("gpt2")
gpt2_tokenizer.encode("This is some text")
# 输出 [1212, 318, 617, 2420]
```

## 4\. 结论[](#4-conclusion)

-   就是这样！这就是 BPE 的简要工作原理，包括创建新分词器的训练方法，以及从原始 OpenAI GPT-2 模型加载 GPT-2 分词器词汇表和合并规则的方法
-   希望这个简短的教程对您的学习有所帮助；如有任何问题，请随时在[此处](https://github.com/rasbt/LLMs-from-scratch/discussions/categories/q-a)开启新的讨论

**代码**

独立的代码笔记本可在[此处](https://github.com/rasbt/LLMs-from-scratch/blob/main/ch02/05_bpe-from-scratch/bpe-from-scratch.ipynb)找到。

## 继续阅读

* * *
