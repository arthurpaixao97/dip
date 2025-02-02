import User from '../../src/api/v2/models/user.js'
import Product from '../../src/api/v2/models/product.js'
import Transaction from '../../src/api/v2/models/transaction.js'
import Offer from '../../src/api/v2/models/offer.js'
import Recurrence from '../../src/api/v2/models/recurrence.js'
import Promotion from '../../src/api/v2/models/promotion.js'

class IDs {
    
    async productID()
    {
        const id = this.generateRandomNumber(7)
        const product = await Product.findOne({id: id})
        if(!product)
        {
            return id
        } else
        {
            const id = this.productID()
        }
    }

    async offerID()
    {
        const id = this.generateRandomLowerCode(8)
        const offer = await Offer.findOne({id: id})
        if(!offer)
        {
            return id
        } else
        {
            const id = this.offerID()
        }
    }

    async transactionID()
    {
        const id = `T${this.generateRandomNumber(10)}`
        const transaction = await Transaction.findOne({id: id})
        if(!transaction)
        {
            return id
        } else
        {
            const id = this.transactionID()
        }
    }

    async recurrenceID()
    {
        const id = this.generateRandomUpperCode(8)
        const recurrence = await Recurrence.findOne({id: id})
        if(!recurrence)
        {
            return id
        } else
        {
            const id = this.recurrenceID()
        }
    }

    async promotionID()
    {
        const id = `${this.generateRandomUpperLetter()}${this.generateRandomUpperCode(7)}`
        const promotion = await Promotion.findOne({id: id})
        if(!promotion)
        {
            return id
        } else
        {
            const id = this.promotionID()
        }        
    }

    generateRandomNumber(digits) {
        if (digits <= 0) {
            throw new Error("The number of digits must be greater than 0.");
        }
        
        let randomNumber = '';
        for (let i = 0; i < digits; i++) {
            const randomDigit = Math.floor(Math.random() * 10); // Random digit between 0 and 9
            randomNumber += randomDigit;
        }
        
        return parseInt(randomNumber, 10); // Convert to a number
    }

    generateRandomLowerCode(length) {
        if (length <= 0) {
          throw new Error("The length must be greater than 0.");
        }
      
        const characters = '0123456789abcdefghijklmnopqrstuvwxyz'; // Possible characters
        let randomCode = '';
      
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          randomCode += characters[randomIndex];
        }
      
        return randomCode;
    }

    generateRandomUpperCode(length) {
        if (length <= 0) {
          throw new Error("The length must be greater than 0.");
        }
      
        const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Possible characters
        let randomCode = '';
      
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          randomCode += characters[randomIndex];
        }
      
        return randomCode;
    }     

    generateRandomUpperLetter(length) {
        if (length <= 0) {
          throw new Error("The length must be greater than 0.");
        }
      
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Possible characters
        
        const randomIndex = Math.floor(Math.random() * characters.length);
        return characters[randomIndex];
    }
      
}

export default new IDs()