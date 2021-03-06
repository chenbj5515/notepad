<template>
    <div class="container">
        <li :class="['node']" v-for="node in data" :key='node.index'>
            <div v-if="node.type === 1">
                <div v-if="hasFolderChild(node)" @mouseup="rightCilckHandle(node)" :class="{
                        isSelected: node.isSelect && node === currentNode,
                        toBeEdit: hasRightClicked && node === currentRightSelectNode
                    }" class="li-hover-item hasChild" :style="{ paddingLeft: ( node.level*15 + 33 ) + 'px' }">
                    <Icon class="arrow" color="#909090" @click.stop="foldHandle(node)" 
                        :style="{
                            left: node.level*15 + 12 + 'px'
                        }" 
                        :class="{
                            rotated: node.open
                        }" v-if="node.children.length > 0" size="15" type="md-arrow-dropright" 
                    />
                    <i class="folderIcon folderIconOpen" color="#797f8d" size="18" v-if="node.children.length > 0 && node.open" type="ios-folder-open"></i>
                    <i class="folderIcon folderIconOutline" size="18" v-if="!node.children || node.children.length === 0 || !node.open" type="ios-folder-outline"></i>
                    <input v-if="isEditing(node)" ref="input" class="editName" v-model="node.name" @focus="focus(node)" @blur="blur(node)" @mouseup.stop="" @click.stop="" type="text">
                    <p class="nodeName" v-else> {{ node.name }} </p>
                </div>
                <div v-else @mouseup="rightCilckHandle(node)" class="li-hover-item hasNoChild" :style="{ paddingLeft: ( node.level*15 + 33 ) + 'px' }" :class="{
                        isSelected: node.isSelect && node === currentNode,
                        toBeEdit: hasRightClicked && node === currentRightSelectNode
                    }">
                    <i class="folderIcon folderIconOutline" size="18" type="ios-folder-outline"></i>
                    <input v-if="isEditing(node)" class="editName" v-model="node.name" @focus="focus(node)" @blur="blur(node)" @mouseup.stop="" @click.stop="" type="text">
                    <p class="nodeName" v-else> {{ node.name }} </p>
                </div>
                <Menu :style="{
                        left: x + 'px',
                        top: y + 'px'   
                    }" class="menu" v-if="isShowMenu(node)" :x='x' :y='y' @deleteNode="deleteNode('right')" @newFolder="newFolder" @newFile="newFile"></Menu>
                <!-- 支持slideDown slideUp效果的动画 -->
                <transition>
                    @before-enter="beforeEnter" @enter="enter" @after-enter="afterEnter" @before-leave="beforeLeave" @leave="leave" @after-leave="afterLeave">
                    <ul v-if="node.children" v-show="node.open">
                        <TreeNode :data="node.children"></TreeNode>
                    </ul>
                </transition>
            </div>
        </li>
    </div>
</template>

<script>
    import TreeNode from './TreeNode'
    import Menu from '../Menu'
    import store from '../../store'
    import TreeOp from '../../util/delete.js'
    import {
        ipcRenderer
    } from 'electron'
    import {
        setTimeout,
        setInterval,
        clearInterval
    } from 'timers';
    export default {
        name: 'TreeNode',
        props: ['data'],
        data() {
            return {
                //记录上一个菜单的坐标是为了右击同一个菜单的时候菜单的位置可以更新
                x: 0,
                y: 0,
                currentFileName: '',
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
                let val = store.state.renaming
                if (!val) {
                    this.afterEditing()
                }
                return val
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
            isAllSelected() {
                return store.state.isAllSelected
            },
            root() {
                return store.state.root
            },
            lastKeyDown() {
                return store.state.lastKeyDown
            },
            currentKeyDown() {
                return store.state.currentKeyDown
            },
            currentFile() {
                return store.state.currentFile
            },
            editingNode() {
                return store.state.editingNode
            }
        },
        methods: {
            afterEditing() {
                let node = this.editingNode
                //编辑结束时，要按照名字的字典序把重命名的文件夹的位置替换到合理的位置,并且通知主进程进行新文件的建立以及重命名等操作
                if (this.root !== node && node) {
                    let parent = TreeOp.getParent(this.root, node)
                    if (parent) {
                        this.avoidSameName()
                        if (this.isNewFolder) {
                            //如果是新建文件的话对应的是node的mkdir操作
                            node.path = `${parent.path}/${node.name}`
                            ipcRenderer.send('generateFolder', node.path)
                        } else {
                            //如果是重命名则对应的是rename操作
                            let pos = node.path.lastIndexOf('/')
                            let folderName = node.path.slice(pos + 1)
                            let newPath = node.path.replace(folderName, node.name)
                            let obj = {
                                oldPath: node.path,
                                newPath
                            }
                            ipcRenderer.send('rename', JSON.stringify(obj))
                            node.path = newPath
                        }
                        //无论是新建还是重命名都需要避免重复命名并且重排位置
                        this.insertNode(node, parent)
                    }
                }
                store.dispatch('invokeSetIsNewFolderState', false)
            },
            hasFolderChild(node) {
                //判断是否有类型为文件夹的子节点
                let num = 0
                if (node.children && node.children.length > 0) {
                    node.children.forEach(item => {
                        if (item.type === 1) {
                            num++
                        }
                    })
                }
                return num === 0 ? false : true
            },
            avoidSameName() {
                let node = this.editingNode
                let parent = TreeOp.getParent(this.root, node)
                let children = parent.children
                children.forEach(item => {
                    if (item !== node && item.name === node.name) {
                        let value = node.name
                        console.log(value)
                        if(value.slice(-1) === ')') {
                            let num = value.slice(0, -1).match(/(\d+)$/g)
                            let lastLeftBracket = value.lastIndexOf('(')
                            let priName = value.slice(0, lastLeftBracket)
                            node.name = `${priName}(${parseInt(num) + 1})`
                        } 
                        else {
                            node.name = `${value}(1)`
                        }
                    }
                })
            },
            insertNode(node, parent) {
                let delIndex = parent.children.indexOf(node)
                parent.children.splice(delIndex, 1)
                let index = this.getInsertPos(parent, node)
                if (index || index === 0) {
                    parent.children.splice(index, 0, node)
                }
            },
            deleteNode(selectType) {
                TreeOp.deleteNode(selectType)
                ipcRenderer.send('delete', this.currentRightSelectNode.path)
            },
            focus(node) {
                // this.currentFileName = node.name
                let dom = document.querySelector('.editName')
                dom.select()
            },
            blur(node) {
                //失焦的时候如果已经没有正在编辑中
            },
            selectDom() {
                // document.querySelector('.editName').focus()
                if (!this.isAllSelected) {
                    document.querySelector('.editName').select()
                    // store.dispatch('invokeSetIsAllSelectedState', true)
                }
            },
            isEditing(node) {
                var val = (node === this.currentRightSelectNode && this.renaming)
                if (val) {
                    store.dispatch('setEditingNode', node)
                    this.$nextTick(() => {
                        this.selectDom()
                    })
                }
                return val
            },
            isShowMenu(node) {
                return node === this.currentRightSelectNode && this.hasRightClicked && !this.globalClicked
            },
            newFile() {
                let node = this.currentRightSelectNode
                let newCh = {
                    open: false,
                    name: '',
                    level: node.level + 1,
                    checked: false,
                    type: 2,
                    path: '',
                }
                if (!node.children) {
                    let children = []
                    //把node.children加入到vue的响应式系统中，这样以后再push就可以自动响应了
                    this.$set(node, 'children', children)
                }
                newCh.name = this.generateFileName(node)
                // let parent = TreeOp.getParent(this.root, node) || this.root
                newCh.path = `${node.path}/${newCh.name}.txt`
                node.children.unshift(newCh)
                store.dispatch('setCurrentFile', newCh)
                ipcRenderer.send('generateFile', newCh.path)
            },
            generateFileName(node) {
                if (node.children && node.children.length > 0) {
                    let num = 0
                    let hasSiblings = false
                    for (var i = 0; i < node.children.length; i++) {
                        if (/^无标题笔记/.test(node.children[i].name)) {
                            hasSiblings = true
                            let count = node.children[i].name.match(/(\d+)$/g)
                            if (count) {
                                return `无标题笔记${parseInt(count) + 1}`
                            }
                        }
                    }
                    if (hasSiblings) {
                        return '无标题笔记1'
                    }
                }
                return '无标题笔记'
            },
            generateFolderName(node) {
                //给node的新文件夹起名字,保证不与之前的重复
                let lastNum = 0
                let flag = true
                if (node.children && node.children.length > 0) {
                    for (var i = 0; i < node.children.length; i++) {
                        if (/^新建文件夹/.test(node.children[i].name)) {
                            let count = node.children[i].name.match(/(\d+)$/g)
                            //如果第一次匹配到新建文件夹就不是’新建文件夹‘，那么说明却新建文件夹，将其返回
                            if (flag && count) {
                                return '新建文件夹'
                            }
                            //如果过了上个return说明有’新建文件夹‘，那么就不再校验这个，flag置为false
                            flag = false
                            if (count && count - lastNum >= 2) {
                                return '新建文件夹' + `${parseInt(lastNum) + 1}`
                            }
                            lastNum = !count ? 0 : count
                        }
                    }
                    //都为新建文件夹的且没有缺的序号的情况
                    return '新建文件夹' + `${parseInt(lastNum) + 1}`
                } else {
                    //没有子节点
                    return '新建文件夹'
                }
            },
            getInsertPos(node, newCh) {
                let chName = newCh.name
                let index = 0
                let hasSiblings = false
                if (node.children && node.children.length > 0) {
                    //name为数字结尾的节点名字中数字之外部分
                    let reg = /\d+$/g
                    let reg1 = /^[0-9]+$/
                    let num = chName.match(reg) && chName.match(reg)[0]
                    if (num && chName !== num) {
                        name = newCh.name.slice(0, -num.length)
                    } else {
                        name = chName
                    }
                    for (var i = 0; i < node.children.length; i++) {
                        let currentChild = node.children[i]
                        let currentChildNum = currentChild.name.match(reg) && currentChild.name.match(reg)[0]
                        //如果是以数字结尾并且不是一个数字则对名字截取数字以外部分，否则不操作
                        let currentChildName = currentChild.name
                        if (currentChildNum && currentChildNum !== currentChild.name) {
                            currentChildName = currentChild.name.slice(0, -currentChildNum.length)
                        }
                        //如果有相同前缀的，则返回合理位置
                        if (name === currentChildName) {
                            if (!num || parseInt(num) < parseInt(currentChildNum)) {
                                //发现满足外层条件且没有数字后缀则直接返回，如果有的话就需要找大于这个数字的节点
                                return i
                            } else {
                                //如果找到同前缀的但是不满足返回条件，则记录有前缀这个信息，并且记录当前的位置，最后插入到同前缀的所有节点的最后
                                hasSiblings = true
                                index = i
                            }
                        }
                        if ((num === chName && currentChildNum === currentChild.name)) {
                            //如果都是数字的话，那么看是不是小于当前的，如果是插入到之前就好，直接return。如果不是，记录当前的位置，遍历结束后插入到节点之后
                            if (parseInt(num) < parseInt(currentChildNum)) {
                                return i
                            }
                            index = i
                        }
                    }
                    if (hasSiblings) {
                        return index + 1
                    }
                    //如果遍历结束也没有找到比要被安排位置的节点大的节点，那么插入到最大的后面
                    if (index) {
                        return index + 1
                    }
                    //如果一直没有找到相同前缀的，则按照字典序排
                    for (var i = 0; i < node.children.length; i++) {
                        let currentChild = node.children[i]
                        if (chName < currentChild.name) {
                            return i
                        }
                    }
                    if (index === 0) {
                        //如果children中没有该名字前缀的孩子
                        node.children.push(newCh)
                    } else {
                        return index + 1
                    }
                } else {
                    node.children.push(newCh)
                }
            },
            newFolder() {
                let node = this.currentRightSelectNode
                let newCh = {
                    open: false,
                    name: '',
                    level: node.level + 1,
                    checked: false,
                    type: 1,
                    path: '',
                }
                newCh.name = this.generateFolderName(node)
                if (!node.children) {
                    let children = []
                    //把node.children加入到vue的响应式系统中，这样以后再push就可以自动响应了
                    this.$set(node, 'children', children)
                }
                let index = this.getInsertPos(node, newCh)
                if (index || index === 0) {
                    node.children.splice(index, 0, newCh)
                }
                store.dispatch('setCurrentRightSelectNode', newCh)
                this.$set(node, 'open', true)
            },
            rightCilckHandle(node) {
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
            //控制折叠收起的点击，只有点击小箭头才会展开
            foldHandle(node) {
                store.dispatch('setCurrentNode', node)
                store.dispatch('invokeSetRenameState', false)
                this.$set(node, 'open', !node.open)
            },
            //控制选中与否的点击，点击除小箭头以外的点都会选中
            selectHandle(node) {
                store.dispatch('invokeSetHasRightClickedState', false)
                store.dispatch('setCurrentNode', node)
                store.dispatch('setCurrentType', 0)
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
        },
        mounted() {
            let dom = document.querySelector('.arrow')
            if (dom) {
                dom.addEventListener('mouseup', () => {
                    event.stopPropagation()
                })
            }
        }
    }
</script>

<style lang="less" scoped>
    .parent {
        width: 120px;
        height: 90px;
        background: tomato;
        position: relative;
    }
    .child {
        width: 20px;
        height: 20px;
        background: thistle;
        position: absolute;
    }
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
    } // .li-hover-item {
    //     z-index: 999999999 !important;
    //     position: absolute;
    // }
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
            width: 218px;
            height: 40px; // background: #f0f0f2;
            // z-index: 9999999999;
            // background: #79ace7;
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
