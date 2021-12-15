import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.esm.browser.js'

const siteUrl = "https://warp-regulator-bd7q33crqa-lz.a.run.app";
const startObj = {
    "name": "Leonid Demidov",
    "email": "leonid.demidov.02@gmail.com"
}

new Vue({
    el: '#app',
    data() {
        return {
            started: false,
            authorizationCode: null,
            message: "",
            time: 0,
            engineStatus: {
                flowRate: null,
                intermix: null
            },
            statistic: []
        }
    },
    methods: {
        async getStart() {
            const response = await request(`${siteUrl}/api/start`, "POST", startObj)
            if(response.status == "OK") {
                this.authorizationCode = response.authorizationCode;
                this.started = true;
                this.message = "";
                this.time = 0
                this.getStatus()
                this.showTime()
      
            }
        },
        finish() {
            this.statistic.push(this.time)
            clearInterval(this.workInter)
            clearInterval(this.intervalTimer)
            this.started = false;
            this.engineStatus.flowRate = null
            this.engineStatus.intermix = null
        },
        async getStatus() {
            this.workInter = setInterval(async () =>{
                const response = await request(`${siteUrl}/api/status`, "GET", this.authorizationCode) 
                // if response is normal, continue regulation
                if(response.statusCode != 400) {
                    this.engineStatus = response;
                    //style for progress bar
                    document.querySelector(".progress-bar").style.width=`${this.engineStatus.intermix * 100}%`
                    //make changes
                    await this.regulator();
                } else {
                    this.message = response.message
                   this.finish()
                }
                }, 1000);
        }, 
        showTime() {
            this.intervalTimer = setInterval(()=> {
                this.time++;
                let minutes = Math.floor(this.time / 60);
                let seconds = this.time % 60;
                document.querySelector(".timer").textContent= `${addZero(minutes)}:${addZero(seconds)}`
            },1000)
        },
        showStatistics() {
            let statistic = document.querySelector(".statistic");
            statistic.innerHTML = ""
            if(this.statistic.length > 0 && !this.started) {
                this.statistic.forEach((time, i) => {
                    let minutes = Math.floor(time / 60);
                    let seconds = time % 60;
                    let mes = `${addZero(minutes)}:${addZero(seconds)}`
                    let p = document.createElement("p")
                    p.style.marginTop = "2px"
                    p.textContent = `${i+1}) ${mes}`
                    statistic.appendChild(p)
                })
            } else {
                statistic.textContent = "Now you have not any statistic! Click start!"
            }
        },
        async regulator() {
            const command = this.engineStatus.flowRate;
            const intermix = this.engineStatus.intermix;           
            let change = 0
            let matterToChange = "matter"
            const coefTotal = 0.18
            const coefChange = 3
            //if HIGH or LOW it means, that there is critical event and we need add (or remove) max value, that we can - coefTotal
            //if OPTIMAL, we have to calculate how many "points" we need to change. Base on this fact, that simple changes Num (that is calculated by formula) could not cope with big numbers (less 0.45 and more 0.55), we need to add coefficient (coefChange). if change with coefficient is too big (more than 0.2) so we simple make changes with number 0.2
            switch(command) {
                case "HIGH":
                    change = -coefTotal
                    break;
                case "LOW":
                    change = coefTotal
                    break;
                case "OPTIMAL":
                    change = (intermix > 0.5) ? intermix - 0.5 : 0.5 - intermix
                    change = Math.round((change * 0.2 / 0.5 * coefChange) * 100) / 100
                    if(intermix > 0.45 && intermix < 0.55) {
                        change *= 3.5
                        change = (change > 0.2) ? 0.2 :change  
                    }
                    break;
            }
            change = Math.round(change *100)/100
            // if intermix < 0.5 it means, that there is more antimatter, than matter. In this case we need to confirm, what type we change: if we need to remove some matter (change is negative), so we make changes with antimatter. If we need add some matter (change is positive), we make changes with matter
            //the same logic with intermix > 0.5 
            if(intermix < 0.5) {
                matterToChange = (change > 0) ? "matter" : "antimatter"
            }else if(intermix > 0.5) {
                matterToChange = (change < 0) ? "matter" : "antimatter"  
            }
            //make request
            const requestBody = {
                "authorizationCode": this.authorizationCode,
                "value": change
            }
            await request(`${siteUrl}/api/adjust/${matterToChange}`, "POST", requestBody)
            //show how many we change
            this.createNumChange(change, (matterToChange == "matter") ? "m" : "am")
        }, 
        createNumChange(num, mes) {
            if(document.querySelector(".change-number")) {
                document.querySelector(".change-number").remove()
            }
            let numDiv = document.createElement("div")
            let flowRateDiv = document.querySelector(".flowRate")
            numDiv.classList.add("change-number", "optimal", "animate__animated", "animate__faster", "animate__fadeInUp")
            if(+num < 0) {
                numDiv.style.color = "#dc3545";
            }
            numDiv.textContent = `${(num > 0) ? '+'+num : num} ${mes}`
            flowRateDiv.appendChild(numDiv)
            setTimeout(()=> {
                numDiv.classList.add("animate__fadeOut")
            },500)
        }
    }
})

function addZero(num) {
    if(num <= 9) {
        return "0"+num;
    }else {
        return num;
    }
} 
// method for request
async function request(url, method="GET", data=null) {
    try {
        const headers = {};
        let body
        if (typeof data === "object") {
            headers['Content-Type'] = 'application/json'
            body = JSON.stringify(data)
        
        }else {
            url+= `?authorizationCode=${data}`
        }
        const response = await fetch(url, {
            method,
            headers,
            body
        })
        .then(response => {
            return response.json()
        })
        .then(data => {
            // console.log("in fetch",data);
            return data
        })
        .catch(res => {
            return res
        })
        // console.log("out of fetch",response);
        return await response;
    } catch (err) {
        console.warn('Error: ', err.message);
    }
}