//This is in Promises
const asyncHandler = (requestHandler) => {
	(req, res,next) => {
		Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
	}
}



export {asyncHandler}


//Related to JavaScript High Order Function for understanding
// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}


//This is in try catch
// const asyncHandler = (fn) => async (req, res, next) => {
// 	try {
// 		await fn(req, res, next)
// 	} catch (error) {
// 		res.status(err.code || 500).json({
// 			success: false,
// 			message: error.message
// 		})
// 	}
// }