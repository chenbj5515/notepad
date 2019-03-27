<template>
  <div class="home" @click="clickHandle" @keydown="keydownHandle">
    <header class="header headerDrag">
      <div class="title center">
        <i class="logo"></i>
        <span class="titleTxt verticalCenter">有道云笔记</span>
      </div>
    </header>
    <center class="container">
      <div class="folders">
        <Tree :data="treeData" />
        <div class="bin" :class="{
                isSelected: isSelected,
                toBeEdit: isToBeEdit
              }" @click="binClickHandle" @mouseup="rightCilckHandle()">
          <i class="binIcon"></i>
          <span>回收站</span>
        </div>
      </div>
      <div class="partLine1"></div>
      <div class="filesContainer">
        <div class="currentFolderName">
          <p>{{ currentNode.name }}</p>
        </div>
        <div class="files">
          <div class="file" v-for="(item, index) in currentFiles" :key="index" @click="fileClickHandle(index, item)" :class="{
              isSelected: index === currentIndex
            }">
            <i class="fileIcon"></i>
            <span class="fileName">{{ item.name }}</span>
          </div>
        </div>
        <div class="totalStas">总共{{ currentFiles.length }}项</div>
      </div>
      <div class="partLine2"></div>
      <div class="fileContent">
        <input v-if="currentSelectFile" class="fileTitle"  type="text" :value="currentSelectFile.name" @blur="titleBlur">
        <quill-editor class="editor" v-if="currentSelectFile" v-model="content" ref="myQuillEditor" :options="editorOption" @blur="onEditorBlur($event)" @focus="onEditorFocus($event)" @change="onEditorChange($event)">
        </quill-editor>
      </div>
    </center>
  </div>
</template>

<script>
  import Tree from './tree/Tree'
  import store from '../store'
  import TreeOp from '../util/delete'
  import {
    ipcRenderer
  } from 'electron'
  import {
    quillEditor
  } from "vue-quill-editor"; //调用编辑器
  import 'quill/dist/quill.core.css';
  import 'quill/dist/quill.snow.css';
  import 'quill/dist/quill.bubble.css';
  import {
    clearInterval
  } from 'timers';
  export default {
    data() {
      return {
        treeData: [{
          open: true,
          name: '我的文件夹',
          level: 0,
          type: 1,
          checked: true,
          path: '我的文件夹',
        }],
        currentIndex: 0, //决定当前选中哪个文件
        isClick: false,
        hasRightClicked: false,
        content: '',
        editorOption: {
          modules: {
            toolbar: [
              [{
                'size': ['small', false, 'large', 'huge']
              }],
              [{
                'font': []
              }],
              ['bold', 'italic', 'underline', 'strike']
            ]
          }
        },
        binNode: {
          name: '回收站'
        }
      }
    },
    components: {
      Tree,
      quillEditor
      // scrollBar
    },
    computed: {
      lastKeyDown() {
        return store.state.lastKeyDown
      },
      currentKeyDown() {
        return store.state.currentKeyDown
      },
      currentSelectFile() {
        return this.currentFiles[this.currentIndex]
      },
      editor() {
        return this.$refs.myQuillEditor.quill;
      },
      currentNode() {
        return store.state.currentNode
      },
      isSelected() {
        return this.binIsSelect && this.currentNode === this.binNode
      },
      binIsSelect() {
        return store.state.binIsSelect
      },
      isToBeEdit() {
        return this.hasRightClicked && this.currentRightSelectNode === null
      },
      currentRightSelectNode() {
        return store.state.currentRightSelectNode
      },
      currentFiles() {
        let arr = []
        if (this.currentNode && this.currentNode.children && this.currentNode.children.length > 0) {
          this.currentNode.children.forEach(item => {
            if (item.type === 2) {
              arr.push(item)
            }
          })
        }
        return arr
      },
      currentFile() {
        return store.state.currentFile
      },
      currentType() {
        return store.state.currentType
      }
    },
    methods: {
      titleBlur() {
        let value = document.querySelector('.fileTitle').value
        this.currentFiles.forEach((item, index) => {
          if (index !== this.currentIndex && item.name === value) {
            console.log(index, this.currentIndex, item.name, value)
            this.currentFiles[this.currentIndex].name = `${value}(1)`
          }
        })
      },
      onEditorReady(editor) {},
      onEditorBlur() {}, // 失去焦点事件
      onEditorFocus() {}, // 获得焦点事件
      onEditorChange() {}, // 内容改变事件
      fileClickHandle(index, item) {
        this.currentIndex = index
        store.dispatch('setCurrentFile', item)
        store.dispatch('setCurrentType', 1)
        ipcRenderer.send('readFile', item.path)
      },
      binClickHandle() {
        store.dispatch('setCurrentNode', this.binNode)
        store.dispatch('setCurrentType', 0)
        store.dispatch('invokeSetBin', true)
      },
      clickHandle() {
        store.dispatch('invokeSetGlobalClickedState', true)
        //全局的点击会保存更改的名字
        store.dispatch('invokeSetRenameState', false)
      },
      keydownHandle() {
        clearInterval(store.state.timer)
        if (event.code === 'Enter') {
          store.dispatch('invokeSetRenameState', false)
        }
      },
      rightCilckHandle() {
        this.hasRightClicked = false
        if (event.button == 2) {
          this.hasRightClicked = true
          store.dispatch('setCurrentRightSelectNode', null)
        }
      },
    },
    created() {
      store.dispatch('invokeSetRoot', this.treeData[0])
    },
    mounted() {
      document.addEventListener('keydown', () => {
        store.dispatch('invokeSetCurrentKeyDown', event.code)
        if (this.lastKeyDown === 'MetaLeft' && this.currentKeyDown === 'Backspace') {
          if (this.currentType === 0) {
            ipcRenderer.send('delete', this.currentNode.path)
            TreeOp.deleteNode('left')
          }
          if (this.currentType === 1) {
            ipcRenderer.send('delete', this.currentFile.path)
            TreeOp.deleteFile()
          }
        }
        if (this.lastKeyDown === 'MetaLeft' && this.currentKeyDown === 'KeyS') {
          let obj = {
            path: this.currentFile.path,
            content: this.content
          }
          ipcRenderer.send('reserve', JSON.stringify(obj))
        }
        store.dispatch('invokeSetLastKeyDown', this.currentKeyDown)
      })
      ipcRenderer.on('readFile-reply', (event, arg) => {
        this.content = arg
      })
    },
  }
</script>

<style lang="less" scoped>
  // ::-webkit-scrollbar {
  //   width: 6px;
  //   position: absolute;
  //   background-color: transparent;
  // }
  // ::-webkit-scrollbar-thumb {
  //   background: rgba(213, 214, 215, 1);
  //   border-radius: 10px;
  //   position: absolute;
  // }
  // ::-webkit-scrollbar-track {
  //   // -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
  //   background-color: transparent;
  //   border-radius: 10px;
  //   position: absolute;
  // }
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
  .toBeEdit {
    border: 1px solid #388def;
    border-radius: 2%;
  }
  .isSelected {
    background: #f0f0f2;
  }
  .home {
    display: flex;
    flex-direction: column;
    height: 100%;
    color: #323232;
    user-select: none;
    cursor: default;
    .header {
      width: 100%;
      height: 61px;
      background: #dfe0e5;
      font-size: 16px;
      color: #7d8599;
      font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
      position: relative; // -webkit-app-region: drag;
      .title {
        user-select: none;
        width: 140px;
        height: 100%;
        line-height: 61px; // background: tan;
        .logo {
          display: inline-block;
          width: 20px;
          height: 20px;
          margin-top: 18px;
          margin-left: 16px;
          background: url('../assets/logo.svg');
          background-position: 0px 40px;
          margin-right: 2px;
        }
        .titleTxt {
          width: 120px;
          display: inline-block;
        }
      }
    }
    .container {
      flex: 1;
      display: flex;
      .folders {
        width: 218px;
        height: 100%;
        overflow: hidden;
        position: relative;
        .bin {
          text-align: left;
          height: 40px;
          line-height: 40px;
          padding-left: 32px;
          font-size: 13px;
          .binIcon {
            vertical-align: middle;
            margin-right: 6px;
            display: inline-block;
            width: 20px;
            height: 20px;
            background-image: url('../assets/logo.svg');
            background-position: -290px 209px;
          }
        }
        &:hover {
          overflow-y: auto; // background: cadetblue;
        } // &::after {
        //   content: '';
        //   position: absolute;
        //   width: 2px;
        //   height: 100%;
        //   // height: 720px;
        //   top: 68px;
        //   right: 0;
        // }
        // &::after:hover {
        //   cursor: ew-resize;
        // }
      }
      .partLine1 {
        width: 1px;
        background: #dfe1e4; // border: 1px solid #dfe1e4;
        &:hover {
          cursor: ew-resize;
        }
      }
      .filesContainer {
        width: 200px;
        height: 100%;
        border-right: 1px solid #dfe1e4;
        // border-top: 0;
        position: relative;
        display: flex;
        flex-direction: column;
        .currentFolderName {
          height: 60px;
          padding: 20px 20px;
          border-bottom: 1px solid #dfe1e4;
          font-size: 13px; 
        }
        .files {
          overflow: auto;
          flex: 1;
          .file {
            width: 100%;
            height: 140px;
            border-bottom: 1px solid #dfe1e4;
            position: relative; // &:nth-last-child(1) {
            //   border-bottom: 1px solid #dfe1e4;
            // }
            .fileIcon {
              display: inline-block;
              width: 20px;
              height: 20px;
              background-image: url('../assets/logo.svg');
              background-position: 0px 40px; // margin: -20px -20px;
              position: absolute;
              left: 20px;
              top: 20px;
            }
            .fileName {
              position: absolute;
              left: 46px;
              top: 23px;
              font-size: 12px;
            }
          }
        }
        .totalStas {
          width: 200px;
          height: 30px;
          border-top: 1px solid #dfe1e4;
          border-right: 1px solid #dfe1e4;
          background: white;
          line-height: 30px;
          text-align: center;
        }
      }
      .fileContent {
        flex: 1;
        display: flex;
        flex-direction: column;
        .editor {
          flex: 1;
          display: flex;
          flex-direction: column;
          border: 0;
        }
        .fileTitle {
          width: 100%;
          height: 60px;
          text-align: left;
          font-size: 18px;
          padding-left: 20px;
          line-height: 60px;
          border: 1px solid #dfe1e4;
          border-left: 0;
          border-top: 0;
          outline: 0;
        }
      }
    }
  }
  .verticalCenter {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
  .headerDrag {
    -webkit-app-region: drag;
  }
  .header:hover {
    background-position: right center;
  }
</style>
