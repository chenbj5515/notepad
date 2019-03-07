<template>
    <div class="menu">
        <div class="menuItem">新建
            <Icon class="arrow-right" size="12" type="md-arrow-dropright" />
            <div class="menuNew" 
                :style="{
                    left: x + 72 + 'px',
                    top: y + 'px'   
                }">
                <div class="menuItem" @click="newFileClickHandle">笔记</div>
                <div class="menuItem" @mouseup.stop="folderMouseupHandle" @click.stop="newFoldClickHandle">文件夹</div>
            </div>
            <!-- <MenuNew  class="menu-new"></MenuNew> -->
        </div>
        <div class="menuItem" @click.stop="renameClickHandle">重命名</div>
        <div class="menuItem" @click="deleteClickHandle">删除</div>
        <div class="menuItem">设置密码</div>
        
    </div>
</template>

<script>
    import store from '../store'
    export default {
        props: ['x', 'y'],
        data() {
            return {
            }
        },
        methods: {
            renameClickHandle() {
                //rename触发input的显示
                store.dispatch('invokeSetRenameState', true)
                this.bindSelectEventListener()
                //全局的点击事件触发时关闭菜单
                store.dispatch('invokeSetGlobalClickedState', true)
                //点击重命名时会清除右击选中状态
                store.dispatch('invokeSetHasRightClickedState', false)
            },
            bindSelectEventListener() {
                this.$nextTick(() => {
                    let input = document.querySelector('.editName')
                    if(input) {
                        input.addEventListener('select', () => {
                            store.dispatch('invokeSetIsAllSelectedState', true)
                        })
                    }
                })
            },
            newFileClickHandle() {

            },
            folderMouseupHandle() {

            },
            newFoldClickHandle() {
                this.$emit('newFolder')
                store.dispatch('invokeSetHasRightClickedState', false)
                store.dispatch('invokeSetIsNewFolderState', true)
                store.dispatch('invokeSetRenameState', true)
                this.bindSelectEventListener()
            },
            deleteClickHandle() {
                this.$emit('deleteNode')
            }
        },
    }
</script>

<style lang="less" scoped>
    .menu {
        width: 72px;
        height: 115px;
        margin-left: 30px;
        box-shadow: #666 0px 0px 3px;
        font-size: 13px;
        text-align: left;
        background: hsl(0, 0%, 97%);
        padding-top: 1px;
        color: #616161;
        position: relative;
        border-radius: 4%;
        .menuItem {
            height: 22px;
            margin-top: 16px;
            padding-left: 10px;
            width: 100%;
            line-height: 24px;
            margin-top: 5px;
            margin-bottom: 2px;
            .arrow-right {
                margin-left: 12px;
                margin-top: -4px;
            }
        }
        .menuItem:hover {
            background: #398dee;
            color: #fffffe;
        }
        .menuNew {
            display: none;
            position: fixed;
            z-index: 999;
            width: 62px;
            margin-left: 30px; // box-shadow: 1px 1px 2px 1px rgba(0,0,0,.16);
            box-shadow: #666 0px 0px 3px;
            border-radius: 4%;
            font-size: 12px;
            text-align: left;
            background: #f7f7f7;
            padding-top: 0px;
            color: #616161; // background: tan
            .menuItem {
                padding-left: 5px;
                width: 100%;
                height: 22px;
                line-height: 22px;
                margin-top: 6px;
                margin-bottom: 6px;
                .arrow-right {
                    margin-left: 12px;
                    margin-top: -2.5px;
                }
            }
            .menuItem:hover {
                background: #398dee;
                color: #fffffe;
            }
        }
        .menuItem:hover .menuNew {
            display: block !important;
        }
    }
</style>