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
      <div class="files">
        <div class="file" v-for="(item, index) in currentFiles" :key="index" @click="fileClickHandle(index)" :class="{
          isSelected: index === currentIndex
        }">
          <i class="fileIcon"></i>
          <span>{{ item.name }}</span>
        </div>
      </div>
      <div class="partLine2"></div>
      <div class="fileContent">
      </div>
    </center>
  </div>
</template>

<script>
  import Tree from './tree/Tree'
  import store from '../store'
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
        currentIndex: 0,//决定当前选中哪个文件
        isClick: false,
        hasRightClicked: false,
      }
    },
    components: {
      Tree,
      // scrollBar
    },
    computed: {
      currentNode() {
        return store.state.currentNode
      },
      isSelected() {
        return this.binIsSelect && this.currentNode === null
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
      }
    },
    watch: {},
    methods: {
      fileClickHandle(index) {
        this.currentIndex = index
      },
      binClickHandle() {
        // this.isClick = true
        store.dispatch('setCurrentNode', null)
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
    }
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
        position: relative; // overflow-y: auto; 
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
        width: 1px; // background: #dfe1e4;
        &:hover {
          cursor: ew-resize;
        }
      }
      .files {
        width: 200px;
        height: 100%;
        overflow: auto; // border-right: 1px solid #dfe1e4;
        // background-image: url('../assets/logo.svg');
        .file {
          width: 100%;
          height: 140px;
          border: 1px solid #dfe1e4;
          border-bottom: 0;
          position: relative;
          .fileIcon {
            display: inline-block;
            width: 20px;
            height: 20px;
            background-image: url('../assets/logo.svg');
            background-position: 0px 40px;
            // margin: -20px -20px;
            position: absolute;
            left: 20px;
            top: 20px;
          }
        }
        // &:hover {}
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
