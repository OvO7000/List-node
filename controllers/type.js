const express = require('express')
const Type = require('../models/type')

const index = async (req, res) => {
    try{
        let types = await Type.find({secret: false})
            .catch(err => Promise.reject({code: 'test'}))
        let result = {}
        for (let type of types) {
            if (!result[type.type]) {
                result[type.type] = []
            }
            const subType = {
                id: type._id,
                name: type.subType.name,
                name_en: type.subType.name_en
            }
            result[type.type].push(subType)
        }
        res.send({status: '200'})
    }
    catch(e){
        console.log(e);
    }
}

module.exports = {
  index
}