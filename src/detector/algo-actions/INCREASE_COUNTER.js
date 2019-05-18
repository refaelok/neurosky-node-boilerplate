export default (data, event) => {
    if (data.blink > 150) {
        return true;
    }

    return false;
}