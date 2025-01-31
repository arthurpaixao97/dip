import transactionServices from "./transactionServices.js"

class DPay {
    async paymentScreening(t)
    {
        const select = Math.floor(Math.random() * 2)

        if(select > 0)
        {   
            await this.gateway1(t)
        } else
        {
            this.gateway2(t)
        }
    }

    async gateway1(t)
    {
        setTimeout(async () => {
            console.log('APPROVED')
            await transactionServices.approve(t)
            
        }, 3000);
    }

    async gateway2(t)
    {
        setTimeout(async () => {
            console.log('CANCELLED')
            await transactionServices.cancel(t)
            
        }, 3000);
    }
}

export default new DPay()