export default class errorHandler {
    static displayError(error) {
        console.error("Error: ", error);
    }

    static showErrorToUser(errorMessage) {
        alert(errorMessage);
    }
}