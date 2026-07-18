#!/usr/bin/env python3
"""Merge curated metadata (meta.json) with scraped case-study content
(raw text files produced from devin.ai/customers pages) into src/data.json.

Usage: python3 scripts/build_data.py <dir-with-*.trim.txt>
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
META = json.load(open(os.path.join(HERE, "meta.json")))
SRC_DIR = sys.argv[1] if len(sys.argv) > 1 else "/tmp/cs"
OUT = os.path.join(HERE, "..", "src", "data.json")

def parse(path):
    sections = []
    quotes = []
    current = None
    seen = set()
    for line in open(path):
        line = line.strip()
        m = re.match(r"\[(h1|h2|h3|p|blockquote)\] (.*)", line)
        if not m:
            continue
        tag, text = m.groups()
        # strip any accidentally concatenated next-article heading
        text = re.sub(r"\[h1\].*$", "", text).strip()
        if not text:
            continue
        if tag == "h1":
            continue
        if tag in ("h2", "h3"):
            if text in ("About the company", "Ready to start working with Devin?",
                        "Ready to clear your backlog?"):
                current = None
                continue
            current = {"heading": text, "paragraphs": []}
            sections.append(current)
        elif tag == "blockquote":
            q = parse_quote(text)
            if q and q["text"] not in seen:
                seen.add(q["text"])
                quotes.append(q)
        else:  # p
            key = text[:80]
            if key in seen:
                continue
            seen.add(key)
            if any(text.startswith(q["text"][:60].lstrip("“\"")) or
                   text.lstrip("“\"").startswith(q["text"][:60]) for q in quotes):
                continue  # duplicate of a blockquote
            if current is None:
                current = {"heading": "", "paragraphs": []}
                sections.append(current)
            current["paragraphs"].append(text)
    attributions = {q["attribution"] for q in quotes if q["attribution"]}
    for s in sections:
        s["paragraphs"] = [p for p in s["paragraphs"] if p not in attributions]
    sections = [s for s in sections if s["paragraphs"]]
    return sections, quotes

def parse_quote(text):
    text = text.strip()
    m = re.match(r"[“\"](.+?)[”\"]\s*[-—–]?\s*(.*)$", text, re.S)
    if m:
        body, attribution = m.group(1).strip(), m.group(2).strip()
    else:
        body, attribution = text, ""
    if len(body) < 20:
        return None
    return {"text": body, "attribution": attribution}

cases = []
for slug, meta in META.items():
    path = os.path.join(SRC_DIR, f"{slug}.trim.txt")
    sections, quotes = parse(path)
    about = meta.get("about", "")
    about_words = set(re.findall(r"\w+", about.lower()))

    def is_about_dup(p):
        if not about_words:
            return False
        words = set(re.findall(r"\w+", p.lower()))
        overlap = len(about_words & words) / len(about_words)
        return overlap > 0.7 and len(p) < len(about) * 2

    for s in sections:
        s["paragraphs"] = [p for p in s["paragraphs"] if not is_about_dup(p)]
    sections = [s for s in sections if s["paragraphs"]]
    cases.append({
        "slug": slug,
        "url": f"https://devin.ai/customers/{slug}",
        **meta,
        "quotes": quotes,
        "sections": sections,
    })

cases.sort(key=lambda c: c["company"].lower())
os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump({"cases": cases}, open(OUT, "w"), indent=1, ensure_ascii=False)
print(f"Wrote {len(cases)} cases to {OUT}")
