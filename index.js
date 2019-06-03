const express = require('express')
const Type = require('./models/type')

console.log('controller')

const list1 = [
    {
        subType: {name: '漫画', name_en: 'comic'},
        type: 'work'
    },{
        subType: {name: '电影', name_en: 'film'},
        type: 'work'
    },{
        subType: {name: '游戏', name_en: 'game'},
        type: 'work'
    },{
        subType: {name: '剧集', name_en: 'teleplay'},
        type: 'work'
    },{
        subType: {name: '节目', name_en: 'program'},
        type: 'work'
    },{
        subType: {name: '书籍', name_en: 'literature'},
        type: 'work'
    },{
        subType: {name: '动画', name_en: 'animation'},
        type: 'work'
    },{
        subType: {name: 'AV', name_en: 'av'},
        type: 'work',
        secret: true
    }]
const list2 = [
    {
        subType: {name: '漫画家', name_en: 'cartoonist'},
        type: 'figure'
    },{
        subType: {name: '作家', name_en: 'writer'},
        type: 'figure'
    },{
        subType: {name: '演员', name_en: 'actor'},
        type: 'figure'
    }]

for (let i = 0; i < list2.length; i++) {
    Type.create(list2[i]).then((doc) => {
        console.log('=== save success');
        console.log(doc);
    })
}






