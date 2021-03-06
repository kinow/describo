<template>
    <el-drawer
        ref="drawer"
        :with-header="false"
        :visible="drawer"
        :destroy-on-close="true"
        direction="ltr"
        size="80%"
        @close="done"
    >
        <div class="flex flex-col p-4 bg-gray-100 h-full">
            <div v-if="!addNewItem">
                <div class="text-xl">Add an item to the crate.</div>
                <div class="my-2">
                    <!-- select item to add to crate -->
                    <el-select
                        v-model="type"
                        placeholder="Select an item type to add to the crate"
                        class="w-full"
                        @change="loadComponent"
                        :filterable="true"
                    >
                        <el-option
                            v-for="item in typeDefinitions"
                            :key="item"
                            :label="item"
                            :value="item"
                        >
                        </el-option>
                    </el-select>
                    <!-- end: select item to add to crate -->
                </div>
            </div>

            <div v-if="addNewItem" class="flex flex-col">
                <div class="text-xl my-4">
                    Edit: {{ item["@type"] }} - {{ item.name }}
                </div>

                <!-- lookup data packs -->
                <lookup-data-pack-component :uuid="item.uuid" @done="done" />

                <div class="overflow-scroll style-content-area flex flex-col">
                    <div v-if="customComponent">
                        <component
                            class="flex-grow"
                            v-bind:is="customComponent"
                            :uuid="item.uuid"
                            :enable-remove="enableRemove"
                            @save="done"
                            @remove="remove"
                        ></component>
                    </div>
                    <div v-else class="flex flex-col">
                        <div class="flex flex-row mt-1 border-b-2 pb-2 ">
                            <div class="flex flex-grow"></div>
                            <el-button
                                @click="done()"
                                type="success"
                                size="small"
                                class="focus:outline-none focus:border-2 focus:border-green-600"
                                :disabled="item && !item.name"
                            >
                                <i class="fas fa-check"></i>&nbsp;done
                            </el-button>
                        </div>

                        <render-profile-component
                            :uuid="item.uuid"
                            @link-item="linkItem"
                        />

                        <div class="flex flex-row mt-1 border-t-2 pt-2">
                            <el-button
                                @click="remove()"
                                type="danger"
                                class="ml-1 focus:outline-none focus:border-2 focus:border-red-600"
                                size="small"
                                v-if="enableRemove"
                            >
                                <i class="fas fa-trash-alt"></i>
                            </el-button>
                            <div class="flex flex-grow"></div>
                            <el-button
                                @click="done()"
                                type="success"
                                size="small"
                                class="focus:outline-none focus:border-2 focus:border-green-600"
                            >
                                <i class="fas fa-check"></i>&nbsp;done
                            </el-button>
                        </div>
                    </div>
                    <render-profile-reverse-component
                        :uuid="item.uuid"
                        class="mt-8"
                        @refresh-parent="refresh"
                        @close="close"
                    />
                </div>
            </div>
        </div>
    </el-drawer>
</template>

<script>
import { uniq } from "lodash";
import {
    CustomComponents,
    isCustomComponent,
    components as CustomComponentMixins,
} from "components/CrateCreator/CoreComponents/custom/component.mixins";

import {
    generateId,
    linkItemToParent,
    unlinkItemFromParentAndChildren,
} from "components/CrateCreator/tools";

import RenderProfileReverseComponent from "./RenderProfileReverse.component.vue";

export default {
    mixins: [CustomComponentMixins],
    components: {
        RenderProfileReverseComponent,
        RenderProfileComponent: () => import("./RenderProfile.component"),
        LookupDataPackComponent: () => import("./LookupDataPack.component.vue"),
    },
    props: {
        drawer: {
            type: Boolean,
            required: true,
        },
    },
    data() {
        return {
            type: undefined,
            profileInputs: [],
            item: {},
        };
    },
    computed: {
        enableRemove: function() {
            return !(
                this.item &&
                this.item["@reverse"] &&
                Object.keys(this.item["@reverse"]).length
            );
        },
        typeDefinitions: function() {
            const typeDefinitions = Object.keys(
                this.$store.state.typeDefinitions
            );
            return uniq([...typeDefinitions, ...CustomComponents]).sort();
        },
        addNewItem: function() {
            const item = this.$store.state.addNewItem;
            if (item && item.itemId) {
                this.item = this.$store.getters.getItemById(item.itemId);
            }
            return item;
        },
        customComponent: function() {
            return isCustomComponent(this.item["@type"])
                ? `${this.item["@type"]}Component`
                : undefined;
        },
    },
    methods: {
        loadComponent() {
            // by definition we're adding a new item - create it and commit it
            const item = {
                "@type": this.type,
                uuid: generateId(),
            };
            this.$store.commit("saveToGraph", item);
            this.$store.commit("addNewItem", {
                itemId: item.uuid,
                parentId: undefined,
                property: undefined,
            });
        },
        remove() {
            if (this.addNewItem && this.addNewItem.parentId) {
                unlinkItemFromParentAndChildren({
                    store: this.$store,
                    parentId: this.addNewItem.parentId,
                    itemId: this.addNewItem.itemId,
                    property: this.addNewItem.property,
                });
            }
            try {
                this.$store.commit("removeFromGraph", {
                    uuid: this.addNewItem.itemId,
                });
                this.close();
            } catch (error) {
                this.$message({
                    type: "error",
                    showClose: true,
                    duration: 6000,
                    message: `The item can't be deleted until all references to it and from it have been deleted first.`,
                });
            }
        },
        linkItem() {
            if (this.addNewItem && this.addNewItem.parentId) {
                linkItemToParent({
                    store: this.$store,
                    parentId: this.addNewItem.parentId,
                    itemId: this.addNewItem.itemId,
                    property: this.addNewItem.property,
                });
            }
        },
        done(drawerDoneHandler) {
            this.linkItem();
            this.close();
        },
        refresh() {
            this.item = this.$store.getters.getItemById(this.item.uuid);
            if (!this.item || !Object.keys(this.item["@reverse"]).length) {
                this.close();
            }
        },
        close() {
            this.item = {};
            this.type = undefined;
            this.$store.commit("addNewItem", undefined);
            this.$emit("close");
        },
    },
};
</script>

<style lang="scss" scoped>
.style-content-area {
    height: calc(100vh - 150px);
}
</style>
