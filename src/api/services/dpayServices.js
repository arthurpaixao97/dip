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
                const nt = await transactionServices.approve(t)
                return nt
            }

            if(res.orderStatus == 'DECLINED')
            {
                console.log('CANCELLED')
                const nt = await transactionServices.cancel(t)
                return nt
            }

            if(res.orderStatus == 'PENDING')
            {
                console.log('PENDING')
                const nt = await transactionServices.setPending(t)
                return nt
            }

            
        })
    }    
}

export default new DPay()