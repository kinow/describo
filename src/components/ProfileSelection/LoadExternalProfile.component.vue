<template>
    <div class="flex flex-row">
        <div class="text-lg text-right pr-10 pt-12 w-1/2 border-r-2">
            Or load a domain specific profile.
        </div>
        <div class="flex flex-col w-1/2 pl-2 space-y-6">
            <div class="flex flex-row">
                <div class="pt-3 mr-2">
                    Load from a local file.
                </div>
                <div class="my-2">
                    <el-button
                        type="primary"
                        round
                        @click="selectFolder"
                        size="small"
                        class="focus:outline-none focus:border-2 focus:border-blue-600"
                    >
                        <i class="fas fa-folder-open"></i> select file
                    </el-button>
                </div>
            </div>
            <div class="flex flex-col my-2">
                <div>Load from a URL.</div>
                <div class="flex flex-row space-x-2">
                    <div class="flex-grow">
                        <el-input type="text" v-model="url"></el-input>
                    </div>
                    <el-button
                        type="primary"
                        round
                        @click="loadRemoteProfile"
                        size="small"
                        :disabled="!url"
                        class="focus:outline-none focus:border-2 focus:border-blue-600"
                    >
                        <i class="fas fa-globe"></i> load profile
                    </el-button>
                </div>
            </div>
            <div class="flex flex-col" v-if="profiles.length">
                <div>Select a previously loaded profile.</div>
                <div
                    v-for="profile of profiles"
                    :key="profile.name"
                    class="cursor-pointer hover:text-orange-500"
                >
                    <div class="flex flex-row">
                        <div>
                            <el-button
                                @click="removeProfile(profile)"
                                type="danger"
                                class="mr-1 focus:outline-none focus:border-2 focus:border-red-600"
                                size="small"
                            >
                                <i class="fas fa-trash-alt"></i>
                            </el-button>
                        </div>
                        <div
                            class="pt-1 flex-grow"
                            @click="
                                $emit('store-profile', {
                                    profile: profile.profile,
                                })
                            "
                        >
                            <i class="fas fa-chevron-right"></i>&nbsp;
                            {{ profile.name }} (version: {{ profile.version }})
                        </div>
                        <div>
                            <el-button
                                type="primary"
                                size="small"
                                @click="refreshProfile(profile)"
                                round
                                class="focus:outline-none focus:border-2 focus:border-blue-600"
                            >
                                <i class="fas fa-sync-alt"></i>
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { remote } from "electron";
import { readJSON } from "fs-extra";
import { basename } from "path";
import { uniqBy, orderBy } from "lodash";
import isUrl from "validator/lib/isUrl";
import { pathExists } from "fs-extra";
import Store from "electron-store";
const store = new Store({ name: "describo-state" });

const isUrlCheckOptions = {
    require_host: true,
    require_protocol: true,
    required_valid_protocol: true,
    require_tld: process.env.NODE_ENV === "development" ? false : true,
};
export default {
    data() {
        return {
            url: undefined,
            profiles: store.get("profiles") || [],
        };
    },
    methods: {
        async selectFolder() {
            let file = await remote.dialog.showOpenDialog({
                properties: ["openFile"],
            });
            if (file.filePaths.length) {
                file = file.filePaths[0];
                this.loadProfile({ file });
                // let profile = await readJSON(file);
                // this.storeProfile({ profile, location: file });
            }
        },
        async loadRemoteProfile() {
            if (!this.url) return;
            if (!isUrl(this.url, isUrlCheckOptions)) {
                this.$message({
                    showClose: true,
                    message: `That doesn't look like a valid URL.`,
                    type: "error",
                });
                return;
            }
            this.loadProfile({ url: this.url });
        },
        async loadProfile({ file, url }) {
            if (file) {
                const exists = await pathExists(file);
                if (await pathExists(file)) {
                    let profile = await readJSON(file);
                    this.storeProfile({ profile, location: file });
                }
            } else if (url) {
                let response = await fetch(url, { cache: "reload" });
                if (response.status !== 200) {
                    this.$message({
                        showClose: true,
                        message: `There was an error retrieving that profile.`,
                        type: "error",
                    });
                    return;
                }
                const profile = await response.json();
                this.storeProfile({ profile, location: url });
            }
        },
        storeProfile({ profile, location }) {
            this.$emit("store-profile", { profile });
            profile = {
                ...profile.metadata,
                location,
                profile,
            };
            this.profiles = this.profiles.filter(
                (p) => p.name !== profile.name
            );
            this.profiles.push(profile);
            this.profiles = orderBy(this.profiles, ["name", "version"]);
            store.set("profiles", this.profiles);
        },
        refreshProfile(profile) {
            if (isUrl(profile.location, isUrlCheckOptions)) {
                this.loadProfile({ url: profile.location });
            } else {
                this.loadProfile({ file: profile.location });
            }
        },
        removeProfile(profile) {
            this.profiles = this.profiles.filter(
                (p) => p.name !== profile.name
            );
            store.set("profiles", this.profiles);
        },
    },
};
</script>

<style lang="scss" scoped></style>
