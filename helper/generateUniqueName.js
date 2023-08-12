const generateUniqueName = (suffix = '') => {

    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    const randomSuffix = Math.floor(Math.random() * 1000); // Add a random component
    
    return `${timestamp}${randomSuffix}${suffix}`;
}

module.exports = generateUniqueName ;