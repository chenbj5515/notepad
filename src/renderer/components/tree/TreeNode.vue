<template>
    <div class="container">
        <li :class="['node',node.children?'':'node-leaf']" v-for="node in data" :key='node.index'>
            <div v-if="node.children" @mouseup="rightCilckHandle(node)" :class="{
                    isSelected: node.isSelect && node === currentNode,
                    toBeEdit: hasRightClicked && node === currentRightSelectNode
                }" class="li-hover-item" :style="{ paddingLeft: ( node.level*15 + 33 ) + 'px' }">
                <Icon class="arrow" color="#909090" @click.stop="foldHandle(node)" :style="{
                    left: node.level*15 + 12 + 'px'
                }" :class="{
                    rotated: node.open
                }" v-if="node.children.length > 0" size="15" type="md-arrow-dropright" />
                <i class="folderIcon folderIconOpen" color="#797f8d" v-if="node.children.length > 0 && node.open" type="ios-folder-open"></i>
                <i class="folderIcon folderIconOutline" v-if="!node.children || node.children.length === 0 || !node.open" type="ios-folder-outline"></i>
                <input v-if="isEditing(node)" ref="input" class="editName" v-model="currentFileName" @focus="focus(node)" @blur="blur(node)" @click.stop="inputClickHandle()" type="text">
                <p class="nodeName" v-else> {{ node.name }} </p>
                <!-- {{node.name}} -->
            </div>
            <div v-else @mouseup="rightCilckHandle(node)" class="li-hover-item" :style="{ paddingLeft: ( node.level*15 + 33 ) + 'px' }" :class="{
                    isSelected: node.isSelect && node === currentNode,
                    toBeEdit: hasRightClicked && node === currentRightSelectNode
                }">
                <i class="folderIcon folderIconOutline" size="18" type="ios-folder-outline"></i>
                <!-- {{node.name}} -->
                <input v-if="isEditing(node)" class="editName" v-model="currentFileName" @focus="focus(node)" @blur="blur(node)" @mouseup.stop="inputMouseupHandle" @click.stop="inputClickHandle()" type="text">
                <p class="nodeName" v-else> {{ node.name }} </p>
            </div>
            <Menu :style="{
                left: x + 'px',
                top: y + 'px'   
            }" class="menu" v-if="isShowMenu(node)" :x='x' :y='y' @newFolder="newFolder"></Menu>
            <!-- 支持slideDown slideUp效果的动画 -->
            <transition>
                @before-enter="beforeEnter" @enter="enter" @after-enter="afterEnter" @before-leave="beforeLeave" @leave="leave" @after-leave="afterLeave">
                <ul v-if="node.children" v-show="node.open">
                    <TreeNode :data="node.children"></TreeNode>
                </ul>
            </transition>
        </li>
    </div>
</template>

<script>
    import TreeNode from './TreeNode'
    import Menu from '../Menu'
    import store from '../../store'
import { setTimeout } from 'timers';
    export default {
        name: 'TreeNode',
        props: ['data'],
        data() {
            return {
                count: 0,
                //记录上一个菜单的坐标是为了右击同一个菜单的时候菜单的位置可以更新
                lastx: 0,
                lasty: 0,
                x: 0,
                y: 0,
                currentFileName: '新建文件夹',
                isShowInput: false,
            }
        },
        components: {
            TreeNode,
            Menu
        },
        computed: {
            currentNode() {
                return store.state.currentNode
            },
            currentRightSelectNode() {
                return store.state.currentRightSelectNode
            },
            renaming() {
                return store.state.renaming
            },
            globalClicked() {
                return store.state.globalClicked
            },
            hasRightClicked() {
                return store.state.hasRightClicked
            },
            isNewFolder() {
                return store.state.isNewFolder
            },
            inputDom() {
                return document.querySelector('.editName') || null
            }

        },
        methods: {
            focus(node) {
                console.log('focus事件', node)
                if(this.isNewFolder) {
                    this.currentFileName = '新建文件夹'
                } else {
                    console.log(node.name)
                    this.currentFileName = node.name
                }
                console.log(event.currentTarget)
                event.currentTarget.select()
            },
            blur(node) {
                node.name = this.currentFileName
                // this.currentFileName = '新建文件夹'
                //失去焦点意味着新建文件夹结束
                store.dispatch('invokeSetIsNewFolderState', false)
            },
            inputMouseupHandle() {},
            isEditing(node) {
                console.log(this.currentRightSelectNode)
                console.log(this.renaming, 'renaming===')
                var val = (node === this.currentRightSelectNode && this.renaming)
                if (val && !this.inputDom) {
                    this.$nextTick(() => {    
                        let dom = document.querySelector('.editName')
                        console.log(dom)
                        if(dom) {
                            dom.focus()
                            dom.select()
                        } 
                    })
                }
                return val
            },
            isShowMenu(node) {
                return node === this.currentRightSelectNode && this.hasRightClicked && !this.globalClicked
            },
            newFolder() {
                console.log('触发了父组件的方法')
                let node = this.currentRightSelectNode
                let newCh = {
                    open: false,
                    name: '新建文件件',
                    level: node.level + 1,
                    checked: false
                }
                if (!node.children) {
                    let children = []
                    //把node.children加入到vue的响应式系统中，这样以后再push就可以自动响应了
                    this.$set(node, 'children', children)
                }
                node.children.push(newCh)
                store.dispatch('setCurrentRightSelectNode', newCh)
                this.$set(node, 'open', true)
            },
            rightCilckHandle(node) {
                console.log('触发了父元素的mouseup事件')
                if (event.button == 2) {
                    this.x = event.clientX - 25
                    this.y = event.clientY + 5
                    store.dispatch('invokeSetGlobalClickedState', false)
                    store.dispatch('invokeSetHasRightClickedState', true)
                    store.dispatch('setCurrentRightSelectNode', node)
                    store.dispatch('invokeSetRenameState', false)
                } else {
                    this.selectHandle(node)
                }
            },
            inputClickHandle() {
                console.log('input内的点击事件')
            },
            //控制折叠收起的点击，只有点击小箭头才会展开
            foldHandle(node) {
                console.log(node)
                store.dispatch('setCurrentNode', node)
                this.$set(node, 'open', !node.open)
            },
            //控制选中与否的点击，点击除小箭头以外的点都会选中
            selectHandle(node) {
                store.dispatch('invokeSetHasRightClickedState', false)
                store.dispatch('setCurrentNode', node)
                //把rename的状态置为false使下次点击重命名才会重新置为true
                store.dispatch('invokeSetRenameState', false)
                //isSelect控制背景色是否为选中时的灰色
                this.$set(node, 'isSelect', true)
                if (node.level === 0 && !node.open) { //如果是根节点，那么选中同时也会展开,但是只是未展开时点击即展开，已经展开时点击不会收起
                    this.foldHandle(node)
                }
            },
            beforeEnter: function(el) {
                el.style.transition = '0.3s height ease-in-out, 0.3s padding-top ease-in-out, 0.3s padding-bottom ease-in-out'
                if (!el.dataset) el.dataset = {}
                el.dataset.oldPaddingTop = el.style.paddingTop
                el.dataset.oldPaddingBottom = el.style.paddingBottom
                el.style.height = 0
                el.style.paddingTop = 0
                el.style.paddingBottom = 0
            },
            enter: function(el) {
                el.dataset.oldOverflow = el.style.overflow
                if (el.scrollHeight !== 0) {
                    el.style.height = el.scrollHeight + 'px'
                    el.style.paddingTop = el.dataset.oldPaddingTop
                    el.style.paddingBottom = el.dataset.oldPaddingBottom
                } else {
                    el.style.height = ''
                    el.style.paddingTop = el.dataset.oldPaddingTop
                    el.style.paddingBottom = el.dataset.oldPaddingBottom
                }
                el.style.overflow = 'hidden'
            },
            afterEnter: function(el) {
                el.style.transition = ''
                el.style.height = ''
                el.style.overflow = el.dataset.oldOverflow
            },
            beforeLeave: function(el) {
                if (!el.dataset) el.dataset = {}
                el.dataset.oldPaddingTop = el.style.paddingTop
                el.dataset.oldPaddingBottom = el.style.paddingBottom
                el.dataset.oldOverflow = el.style.overflow
                el.style.height = el.scrollHeight + 'px'
                el.style.overflow = 'hidden'
            },
            leave: function(el) {
                if (el.scrollHeight !== 0) {
                    el.style.transition = '0.3s height ease-in-out, 0.3s padding-top ease-in-out, 0.3s padding-bottom ease-in-out'
                    el.style.height = 0
                    el.style.paddingTop = 0
                    el.style.paddingBottom = 0
                }
            },
            afterLeave: function(el) {
                el.style.transition = ''
                el.style.height = ''
                el.style.overflow = el.dataset.oldOverflow
                el.style.paddingTop = el.dataset.oldPaddingTop
                el.style.paddingBottom = el.dataset.oldPaddingBottom
            }
        }
    }
</script>

<style lang="less" scoped>
    * {
        margin: 0;
        padding: 0;
        border: 0;
    }
    .rotated {
        transform: rotate(90deg);
    }
    .isSelected {
        background: #f0f0f2;
    }
    .toBeEdit {
        border: 1px solid #388def;
        border-radius: 2%;
    }
    .node {
        cursor: default;
        font-family: monospace;
        line-height: 30px;
        font-size: 13px;
        font-weight: 400;
        color: #323232;
        .menu {
            z-index: 999;
            position: fixed; // left: 50%;
            // top: 0%;
        }
        .li-hover-item {
            position: relative;
            height: 40px;
            line-height: 40px; // padding-left: 100px; 
            .arrow {
                position: absolute;
                top: 12px;
            }
            .editName {
                font-family: arial;
                display: inline-block; 
                outline: 0;
                width: 90px;
                height: 23px;
                border: 1px solid #79ace7;
                margin-left: -6px;
                border-radius: 4%;
                line-height: 23px;
                padding-left: 2px;
            }
            .nodeName {
                display: inline-block;
                font-family: arial; // margin-left: 20px;
            }
        }
        .cover-ctn {
            position: absolute;
            left: 0;
        }
        .tree-node-mark {
            display: block;
            width: 14px;
            height: 14px;
            border: 1px solid red;
            border-radius: 50%;
            text-align: center;
            float: right;
            margin-right: 20px;
            margin-top: 7px;
            border: 1px solid rgba(224, 224, 224, 1);
            background: white;
            &.el-icon-circle-check {
                background: red;
            }
        }
    }
    .folderIcon {
        position: relative;
        display: inline-block;
        background-image: url('../../assets/logo.svg');
        vertical-align: middle;
        margin-top: 2px;
        width: 20px;
        height: 18px;
    }
    .folderIconOpen {
        background-position: -70px 165px;
    }
    .folderIconOutline {
        background-position: -95px 165px;
    }
    .plus-icon {
        position: relative;
        display: inline-block;
        width: 12px;
        height: 11px;
        border: 1px solid #A5A5A5;
        border-radius: 2px;
        vertical-align: middle;
        margin-top: -2px;
    }
    ul,
    li {
        list-style-type: none;
    }
    .close-open-icon {
        width: 14px;
        height: 14px;
        border-radius: 2px;
        border: 1px solid #A5A5A5;
        display: inline-block;
        text-align: center;
        line-height: 9px;
        font-size: 14px;
        color: #666666;
        font-weight: 400;
        vertical-align: middle;
        margin-top: -2px;
        margin-right: 4px;
    }
</style>
