<template>
  <div>
    <ul class="tree-ctn">
      <TreeNode :data='data'></TreeNode>
    </ul>
  </div>
</template>

<script>
  import TreeOp from '../../util/delete'
  import TreeNode from './TreeNode'
  import store from '../../store'
  export default {
    name: 'Tree',
    props: ['data'],
    data() {
      return {
        container: null,
      }
    },
    components: {
      TreeNode
    },
    computed: {
      lastKeyDown() {
        return store.state.lastKeyDown
      },
      currentKeyDown() {
        return store.state.currentKeyDown
      },
      currentNode() {
        return store.state.currentNode
      }
    },
    mounted() {
      this.container = document.querySelector('.container')
      this.preventMenu()
      document.addEventListener('keydown', () => {
        store.dispatch('invokeSetCurrentKeyDown', event.code)
        if (this.lastKeyDown === '') {
          store.dispatch('invokeSetLastKeyDown', event.code)
        }
        if (this.lastKeyDown === 'MetaLeft' && this.currentKeyDown === 'Backspace') {
          TreeOp.deleteNode('left')
        }
      })
      document.addEventListener('keyup', () => {
        store.dispatch('invokeSetCurrentKeyDown', '')
        store.dispatch('invokeSetLastKeyDown', '')
      })
    },
    methods: {
      preventMenu() {
        this.container.addEventListener('contextmenu', e => {
          e.preventDefault();
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .tree-ctn {
    overflow-x: hidden;
    border-radius: 2px; // border: 1px solid rgba(208, 208, 208, 1);
    position: relative; // max-height: 300px;
    overflow-y: auto; // 禁止选中文字
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    text-align: left;
  }
</style>
