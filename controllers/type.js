const Type = require('../models/type')

const util = require('../lib/util')


/**
 * 获取 type 列表
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const index = async (req, res, next) => {
    try{
        let conditions = {}
        if (!req.role || req.role.level < 1) {
            conditions.secret = false
        }
        let types = await Type.find(conditions)
            .catch(err => Promise.reject(err))
        let result = {}
        for (let type of types) {
            // type 有 type、subType 属性
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
        res.send(result)
    }
    catch(e){
        next(e)
    }
}


module.exports = {
  index
}