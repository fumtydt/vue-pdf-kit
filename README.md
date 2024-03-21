# vue-pdf-kit

A high-definition PDF viewer component for Vue 2 & Vue 3.

[![npm Version](https://img.shields.io/npm/v/vue-pdf-kit?style=plastic)](https://npmjs.com/package/vue-pdf-kit)
[![npm Downloads](https://img.shields.io/npm/dm/vue-pdf-kit?style=plastic)](https://npmjs.com/package/vue-pdf-kit)
[![License](https://img.shields.io/npm/l/vue-pdf-kit?style=plastic)](https://github.com/fumtydt/vue-pdf-kit/blob/master/LICENSE)

## Features

- Ensures high-definition rendering of PDFs.
- Renders PDF documents in Vue applications, with support for both Vue 2 and Vue 3.
- Enables text selection and search within the rendered PDF documents.
- Supports rendering annotations within PDF.

## Installation & Usage

```shell
npm install vue-pdf-kit
```

```shell
yarn add vue-pdf-kit
```

## Usage

```vue
<script setup>
import VuePdfKit from 'vue-pdf-kit'
</script>

<template>
  <VuePdfKit source="<url> | <base64>" enableTextLayer enableAnnotation />
</template>
```

If you want to use the component in `Vue 2.6`, you will install it as follows:

```shell
npm i @vue/composition-api
```

### Props

| Name             | Type                  | Accepted values   | Description                                        |
| ---------------- | --------------------- | ----------------- | -------------------------------------------------- |
| source           | `string` <br> `object | URL or Base64     | Source of the document to display                  |
| scale            | `number`              | numbers           | The ratio of canvas size to document size          |
| enableTextLayer  | `boolean`             | `true` or `false` | whether the text layer should be enabled           |
| enableAnnotation | `boolean`             | `true` or `false` | Whether annotations should be enabled              |
| password         | `string`              | Any string        | Password for encrypted documents, if required      |
| enableCMap       | `boolean`             | `true` or `false` | Enables Character Maps for accurate text rendering |

### Events

| Name     | Value               | Description                                                                                            |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------ |
| progress | `0-1 number`        | Represents the current progress or completion ratio of a task or operation, expressed as a percentage. |
| password | `{callback:()=>{}}` | Contains properties related to password handling.                                                      |

## License

MIT License. Please see [LICENSE file](LICENSE) for more information.
