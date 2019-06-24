const moment = require('moment')
const dotaccess = require('@ctxify/dotaccess')
const defaults = require('./defaults.json')

/**
@param {string|null} magicArg
@param {object|null} options
@param {object}      ctx

If there is no magic arg, returns Date.now() formatted according to default format
All options are simply a function you could call to modify the moment object.
So you can pass {'format':'LLLL', 'locale':'zh-cn'} to call 
**/
function ctxifymoment(magicArg, options, ctx){
	options = Object.assign({}, defaults, options)
	if(!magicArg){
		return applyOptions(moment(), options).format(options.format)
	} else {
		let timestring = dotaccess(ctx, magicArg)
		// unexpected behavior occurs when the value returned by dotaccess is not a timestamp... object passed to moment() is still valid, but time is set to midnight :/
		if(!timestring){
			throw new Error(`I was told to expect a ZULU time string or a unix timestamp in milliseconds at the location ${magicArg}, found nothing instead`)
		}
		let timeobject = moment(timestring)
		if(timeobject.isValid() == false){
			throw new Error(`I was told to expect a ZULU time string or a unix timestamp in milliseconds at the location ${magicArg}, but I found ${timeobject}`)
		}
		return applyOptions(timeobject).format(options.format)
	}
}

/**
@param  {moment} moment
@param  {object} options
@return {moment}

Throw an error if an option is passed which is not the name of a function that exists on the moment
**/
function applyOptions(moment, options){
	for(var optionName in options){
		if(optionName == 'format') continue
		optionValue = options[optionName]
		if(moment[optionName] instanceof Function == false){
			throw new Error("An option passed to #!moment is invalid: only names of Moment methods can be used as an option")
		} else {
			moment[optionName](optionValue)
		}
	}
	return moment
}

module.exports = ctxifymoment