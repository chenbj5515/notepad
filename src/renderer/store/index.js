import Vue from 'vue'
import Vuex from 'vuex'

import { createPersistedState, createSharedMutations } from 'vuex-electron'

// import modules from './modules'

Vue.use(Vuex)
const state = {
  currentNode: null,
  lastNode: null,
  //维护这两个变量是为了右击不会影响上面两个变量
  currentRightSelectNode: null,
  lastRightSelectNode: null,
  binIsSelect: false,
  //控制重命名输入框
  renaming: false,
  //控制菜单的显示
  globalClicked: false,
  //控制被右键点击时的蓝色边框
  hasRightClicked: false,
  //重命名和新建文件夹都会让input框出现,要区分这种情况,在点击新建->文件夹时置为true，在renaming置为false的
  isNewFolder: false,
  //保证每次重命名时都只出现一次自动全选
  isAllSelected: false,
  //根节点
  root: {},
  //记录上一个按下的按键
  lastKeyDown: '',
  //记录当前按下的按键
  currentKeyDown: '',
  nameBeforeEdit: '',
}
const getters = {
}

const mutations = {
  setFunc(state, val) {
    Vue.set(state, 'lastNode', state.currentNode)
    Vue.set(state, 'currentNode', val)
    //保证永远只有当前的node的isSelect为true
    if(state.lastNode && state.lastNode != state.currentNode) {
      Vue.set(state.lastNode, 'isSelect', false)
      Vue.set(state, 'binIsSelect', false)
      //当切换当前左击选中节点时，按键状态丢失
      this.dispatch('invokeSetCurrentKeyDown', '')
      this.dispatch('invokeSetLastKeyDown', '')
    }
    //右击不会影响点击的影响，但是点击时要能清除右击造成的状态
    this.dispatch('setCurrentRightSelectNode', val)
  },
  setRightSelectNode(state, val) {
    Vue.set(state, 'lastRightSelectNode', state.currentRightSelectNode)
    Vue.set(state, 'currentRightSelectNode', val)
    //保证永远只有当前的node的isSelect为true
    if(state.lastRightSelectNode && state.lastRightSelectNode != state.currentRightSelectNode) {
      //当切换当前右击选中节点时，按键状态丢失
      this.dispatch('invokeSetCurrentKeyDown', '')
      this.dispatch('invokeSetLastKeyDown', '')
    }
  },
  setBinSelectState(state, val) {
    Vue.set(state, 'binIsSelect', val)
  },
  setRenameState(state, val) {
    Vue.set(state, 'renaming', val)
  },
  setGlobalClickedState(state, val) {
    Vue.set(state, 'globalClicked', val)
  },
  setHasRightClickedState(state, val) {
    Vue.set(state, 'hasRightClicked', val)
  },
  setIsNewFolderState(state, val) {
    Vue.set(state, 'isNewFolder', val)
  },
  setIsAllSelectedState(state, val) {
    Vue.set(state, 'isAllSelected', val)
  },
  setRoot(state, val) {
    Vue.set(state, 'root', val)
  },
  setLastKeyDown(state, val) {
    Vue.set(state, 'lastKeyDown', val)
  },
  setCurrentKeyDown(state, val) {
    Vue.set(state, 'currentKeyDown', val)
  },
  setNameBeforeEdit(state, val) {
    Vue.set(state, 'nameBeforeEdit', val)
  }
}

const actions = {
  setCurrentNode(context, val) {
    context.commit('setFunc', val)
  },
  setCurrentRightSelectNode(context, val) {
    context.commit('setRightSelectNode', val)
  },
  clearSelect(context) {
    context.commit('clearSelect')
  },
  invokeSetBin(context, val) {
    context.commit('setBinSelectState', val)
  },
  invokeSetRenameState(context, val) {
    context.commit('setRenameState', val)
    if(val) {
      this.dispatch('invokeSetIsAllSelectedState', false)
    }
  },
  invokeSetGlobalClickedState(context, val) {
    context.commit('setGlobalClickedState', val)
  },
  invokeSetHasRightClickedState(context, val) {
    context.commit('setHasRightClickedState', val)
  },
  invokeSetIsNewFolderState(context, val) {
    context.commit('setIsNewFolderState', val)
  },
  invokeSetIsAllSelectedState(context, val) {
    context.commit('setIsAllSelectedState', val)
  },
  invokeSetRoot(context, val) {
    context.commit('setRoot', val)
  },
  invokeSetLastKeyDown(context, val) {
    context.commit('setLastKeyDown', val)
  },
  invokeSetCurrentKeyDown(context, val) {
    context.commit('setCurrentKeyDown', val)
  },
  invokeSetNameBeforeEdit(context, val) {
    context.commit('setNameBeforeEdit', val)
  }
}

export default new Vuex.Store({
  // modules,
  state,
  getters,
  mutations,
  actions,
  plugins: [
    createPersistedState(),
    // createSharedMutations() 
    // 如果不需要与主进程共享状态的话就注掉
  ],
  // strict: process.env.NODE_ENV !== 'production'
  // 严格模式开启的话，任何不是mutations引起的状态改变都会报错，所以注调
})
