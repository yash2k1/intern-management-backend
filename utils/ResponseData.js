export class ResponseData {
    constructor(status, statusCode, message, data) {
        this.status = status;           // "success" or "error"
        this.statusCode = statusCode;   // 200, 400, 401, 402, 403, 404, 405, or 500
        this.message = message;         // string or null
        this.data = data;               // any data
    }
}
