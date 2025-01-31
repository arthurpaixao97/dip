import transactionServices from "./transactionServices.js"

class DPay {
    async paymentScreening(t)
    {
        

        await fetch('http://localhost:9090/',{
            method:'POST',
            headers:{
                "content-type":"application/json"
            },
            body:JSON.stringify({
                payment:{
                    method:t.paymentInfo.method,
                    credit_card:t.paymentInfo.details.credit_card
                }
            })
        })
        .then(r => r.json())
        .then(async res => {
            if(res.orderStatus == 'AUTHORISED')
            {
                console.log('APPROVED')
                await transactionServices.approve(t)
            }

            if(res.orderStatus == 'DECLINED')
            {
                console.log('CANCELLED')
                await transactionServices.cancel(t)
            }

            if(res.orderStatus == 'PENDING')
            {
                console.log('PENDING')
                await transactionServices.setPending(t)
            }

            return res
        })
    }    
}

export default new DPay()