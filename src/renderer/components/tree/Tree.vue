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
  import {ipcRenderer} from 'electron'
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
      currentNode() {
        return store.state.currentNode
      },
      currentType() {
        return store.state.currentType
      }
    },
    mounted() {
      this.container = document.querySelector('.container')
      this.preventMenu()
      document.addEventListener('keydown', () => {
        console.log(event.code)
        store.dispatch('invokeSetCurrentKeyDown', event.code)
        if (this.lastKeyDown === 'MetaLeft' && this.currentKeyDown === 'Backspace') {
          if(this.currentType === 0) {
            console.log('要删的是文件夹')
            ipcRenderer.send('delete', this.currentNode.path)
            TreeOp.deleteNode('left')
          }
          if(this.currentType === 1) {
            console.log('要删的是文件')
            console.log(this.currentFile)
            ipcRenderer.send('delete', this.currentFile.path)
            TreeOp.deleteFile()
          }
        }
        if (this.lastKeyDown === 'MetaLeft' && this.currentKeyDown === 'keyS') {

        }
        store.dispatch('invokeSetLastKeyDown', this.currentKeyDown)
      })
    },
    methods: {
      preventMenu() {
        this.container.addEventListener('contextmenu', e => {
          e.preventDefault();
        })
      }
    },
    mounted() {
      this.container = document.querySelector('.container')
      this.preventMenu()
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
