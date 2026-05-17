<template>
  <span>
    <template
      v-for="(part, index) in parts"
      :key="index"
    >
      <mark
        v-if="part.highlighted"
        class="highlighted-text__mark"
      >
        {{ part.text }}
      </mark>
      <template v-else>
        {{ part.text }}
      </template>
    </template>
  </span>
</template>
<script setup lang="ts">
import { computed } from 'vue';

type TextPart = {
  text: string;
  highlighted: boolean;
};

defineOptions({ name: 'HighlightedText' });

const props = defineProps({
  text: {
    type: [String, Number],
    default: '',
  },
  query: {
    type: String,
    default: '',
  },
});

const parts = computed<TextPart[]>(() => {
  const source = String(props.text ?? '');
  const query = props.query.trim();

  if (!query) {
    return [{ text: source, highlighted: false }];
  }

  const result: TextPart[] = [];
  const lowerSource = source.toLowerCase();
  const lowerQuery = query.toLowerCase();

  let index = 0;
  let matchIndex = lowerSource.indexOf(lowerQuery);

  while (matchIndex !== -1) {
    if (matchIndex > index) {
      result.push({
        text: source.slice(index, matchIndex),
        highlighted: false,
      });
    }

    result.push({
      text: source.slice(matchIndex, matchIndex + query.length),
      highlighted: true,
    });

    index = matchIndex + query.length;
    matchIndex = lowerSource.indexOf(lowerQuery, index);
  }

  if (index < source.length) {
    result.push({
      text: source.slice(index),
      highlighted: false,
    });
  }

  return result;
});
</script>
<style scoped>
.highlighted-text__mark {
  background-color: #ffc069;
  padding: 0;
}
</style>
