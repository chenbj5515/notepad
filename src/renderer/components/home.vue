<template>
  <div class="home">
    <header class="header headerDrag">
      <div class="title center">
        <i class="logo"></i>
        <span class="titleTxt verticalCenter">有道云笔记</span>
      </div>
    </header>
    <div class="folders">
    </div>
    <div class="files">
    </div>
    <div class="fileContent">
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
      }
    },
    watch: {},
    methods: {
    }
  }
</script>

<style lang="less" scoped>
  .center {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .verticalCenter {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
  .header {
    width: 100%;
    height: 61px;
    background: #d4d5db;
    color: #7d8599;
    font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
    position: relative; // -webkit-app-region: drag;
    .title {
      user-select: none;
      width: 140px;
      height: 100%;
      line-height: 61px;
      // background: tan;
      .logo {
        display: inline-block;
        width: 20px;
        height: 20px;
        margin-top: 18px;
        margin-left: 16px;
        background: url('https://note.youdao.com/web/images/sprite-4ce3c9eaa2.svg');
        background-position: 0px 40px;
        margin-right: 2px;
      }
      .titleTxt {
        width: 120px;
        display: inline-block;
      }
    }
  }
  .headerDrag {
    -webkit-app-region: drag;
  }
  .header:hover {
    background-position: right center;
  }
</style>
