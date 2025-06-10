<script setup lang="ts">
import { ref } from 'vue'
import { parseHTML } from 'kaf'
// import { parseHTML } from 'zeed-dom'
import { Parser, DomHandler } from 'htmlparser2'

const input = ref('')
const output = ref('')

const onInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  input.value = target.value

  const handler = new DomHandler()
  const parser = new Parser(handler)

  const html = input.value

  // parser.parseComplete(html)
  parseHTML(html).doc

  output.value = input.value
}

</script>

<template>
  <div class="container">
    <div class="title">input</div>
    <textarea class="input" @input="onInput"></textarea>

    <div class="title">output</div>
    <div class="output">{{ output }}</div>
  </div>
</template>

<style scoped>
.title {
  padding: 10px 0;
}

.input,
.output {
  width: 100%;
  height: auto;
  min-height: 200px;
  margin-bottom: 20px;
  font-size: 16px;
  border: 1px solid #ccc;
}

.container {
  padding: 20px;
}

</style>
