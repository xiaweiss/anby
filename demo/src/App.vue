<script setup lang="ts">
import { ref } from 'vue'
import { parse } from 'kaf'

const input = ref('')
const output = ref('')

const onInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  input.value = target.value

  output.value = parse(input.value)
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
