//接收DTO对象，验证type和required
let utils = require('./utils');

function getValidationRule() {
	return {
		'required':{
			validate:function (value) {
				if(value === '' || value === 'undefined' || value === 'null'){
					return false
				}
				if(value === 0){
					return true
				}
				return Boolean(value)
			},
			message:function (key) {
				return `${key} is required`
			}
		},
		'pattern':{
			validate:function (value,pattern) {
				return new RegExp(pattern).test(value)
			},
			message:function (key) {
				return `${key} is invalid`
			}
		},
		'min':{
			validate:function (value,min) {
				return value > min
			},
			message:function (key) {
				return `${key} is invalid`
			}
		},
		'max':{
			validate:function (max) {
				return value < max
			},
			message:function (key) {
				return `${key} is invalid`
			}
		},
		'email':{
			validate:function (value) {
				return /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(value)
			},
			message:function (key) {
				return `${key} is invalid email`
			}
		},
		'tel':{
			validate:function (value) {
				if(value === ''){
					return true
				}
				return /0\d{2}-\d{7,8}/.test(value)
			},
			message:function (key) {
				return `${key} is invalid tel`
			}
		},
		'url':{
			validate:function (value) {
				if(value === ''){
					return true
				}
				return /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/.test(value)
			},
			message:function (key) {
				return `${key} is invalid url`
			}
		},
	}
}

function validateDto(value,dto) {
	console.log(`-------- validateDto -------`);
	console.log(value);
	console.log(dto);
	if(!utils.isKeyValue(value)){
		return false;
	}
	if(!dto){
		return value
	}
	let errorItem = null;
	let errorKey = null;
	let message = null;
	let ruleMap = getValidationRule();
	for(let k in dto){
		//validate required
		let thisValue = value[k];
		let validation = dto[k].validation || {};
		let required = validation.required;
		let validationType = validation.type;
		let pattern = validation.pattern;
		let max = validation.max;
		let min = validation.min;
		let thisTemp = {
			required,
			[validationType]:validationType,
			pattern,
			max,
			min
		};
		// console.log('---------- k --------');
		// console.log(k);
		// console.log(k);
		// console.log(validation);
		// console.log(thisTemp);
		for(let j in thisTemp){
			let ruleValue = thisTemp[j];
			// console.log('------- ruleValue ------');
			// console.log(k);
			// console.log(j);
			// console.log(ruleValue);
			// console.log(thisValue);
			// console.log(ruleValue !== undefined);
			// console.log(ruleValue !== undefined && ruleMap[j]);
			if(ruleValue !== undefined && ruleMap[j]){
				if(!ruleMap[j].validate(thisValue,ruleValue)){
					errorItem = j;
					errorKey = k;
					message = ruleMap[j].message(k);
					return {
						errorItem,
						errorKey,
						message
					}
				}
			}
		}
	}

	return null
}

module.exports = validateDto;
