import transactionServices from "./transactionServices.js"

class DPay {

    async processTransaction(t)
    {
        var ret = null
        if(t.type != 'CARD_VALIDATION')
        {
            const p = await this.paymentScreening(t)
            ret = p
        } else
        {
            const v = await this.validateCard(t)
            ret = v
        }

        return ret
    }

    async paymentScreening(t)
    {
        var ret = {}
        var endpoint = ''

        if(t.paymentInfo.method == 'CREDIT_CARD')
        {
            endpoint = 'creditCard'
        }
        if(t.paymentInfo.method == 'PIX')
        {
            endpoint = 'pix'
        }
        if(t.paymentInfo.method == 'BILLET')
        {
            endpoint = 'billet'
        }

        await fetch(`http://localhost:9090/api/payment/${endpoint}`,{
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
                ret = nt
            }

            if(res.orderStatus == 'DECLINED')
            {
                console.log('CANCELLED')
                t.refusal = res.reason
                const nt = await transactionServices.cancel(t)
                ret = nt
            }

            if(res.orderStatus == 'PENDING')
            {
                console.log('PENDING')
                const nt = await transactionServices.setPending(t)
                ret = nt
            }
            
        })
        return ret
    }    

    async validateCard(t)
    {
        var v = await fetch(`http://localhost:9090/api/validation`, {
            method:'POST',
            headers:{
                'content-type':'application/json'
            },
            body:JSON.stringify({
                card_data:t.paymentInfo.details.credit_card
            })
        })

        v = await v.json()

        return v
    }
}

export default new DPay()