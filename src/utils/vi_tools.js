// Need Package
// - 

import qrcode from "qrcodejs2"


export async function post_data(url, json_data, timeout = 10000, header = {}) {
    // set timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    header['Content-Type'] = 'application/json'
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: header,
            body: JSON.stringify(json_data),
            signal: controller.signal, // Associate the AbortController's signal with the fetch request
        })

        if (response.ok) {
            let resp = await response.json()
            return resp
        } else {
            console.log('Not 200 status', response)
            return response.json()
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('TIME OUT ERROR! ABORT THE REQUEST!')
            return {
                code: 20003,
                res: '请求超时，请重试！Time Out!',
            }
        } else {
            console.log(`CHECK OUT INTERNET ERROR:${error}`)
            return {
                code: 20003,
                res: '网络错误'
           }
        }

    } finally {
        // Clear the timeout if the fetch request completes successfully or with an error
        clearTimeout(timeoutId) 
    }
}

export async function get_data(url, timeout = 5000) {
    // set timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal, // Associate the AbortController's signal with the fetch request
        })

        if (response.ok) {
            return await response.json();
        } else {
            console.log('Not 200 status', response.status, response)
        }
    } catch (error) {
        console.log('Error:', error)
    } finally {
        clearTimeout(timeoutId); // Clear the timeout if the fetch request completes successfully or with an error
    }
}

export function format_date(date, key_word, timezone = 'china') {
    if (date == null) {
        return null
    }

    let cur_time = date == '' ? new Date() : new Date(date)
    
    switch (timezone) {
        case 'gmt':
            let temp = cur_time.getTime()
            cur_time = new Date(temp - 8*60*60*1000)
    }

    const year = cur_time.getFullYear() 
    const month = (cur_time.getMonth() + 1).toString().padStart(2, '0') // index start with 0
    const day = cur_time.getDate().toString().padStart(2, '0') 
    const hour = cur_time.getHours().toString().padStart(2, '0') 
    const min = cur_time.getMinutes().toString().padStart(2, '0') 
    const second = cur_time.getSeconds().toString().padStart(2, '0') 

    const all = `${year}-${month}-${day} ${hour}:${min}:${second}`

    const date_time = `${year}-${month}-${day}`

    const upload_all = `${year}_${month}_${day}_${hour}_${min}_${second}`
    switch (key_word) {
        case 'year':
        case 'y':
            return year
        case 'month':
        case 'm':
            return month
        case 'day':
        case 'd':
            return day
        case 'hour':
        case 'h':
            return hour
        case 'minute':
        case 'min':
            return min
        case 'second':
        case 's':
            return second
        case 'all':
            return all
        case 'upload_time':
            return upload_all
        case 'date_time':
            return date_time
        default:
            return cur_time
    }
}



export function format_period(date1, date2) {
    // Parse the dates
    let v1 = new Date(date1)
    let v2 = new Date(date2)

    // Calculate the difference in milliseconds
    let diff = Math.abs(v2 - v1)

    // Calculate the difference in hours, minutes, and seconds
    let hours = Math.floor(diff / (1000 * 60 * 60))
    diff -= hours * (1000 * 60 * 60)

    let minutes = Math.floor(diff / (1000 * 60))
    diff -= minutes * (1000 * 60)

    let seconds = Math.floor(diff / 1000)

    // Format the result as a string
    let formattedResult = `${hours}时${minutes}分${seconds}秒`
    return v1 <= v2 ? formattedResult : ''
}

function sort_dict(obj) {
    const sortedKeys = Object.keys(obj).sort()
    const sortedObj = {}

    sortedKeys.forEach(key => {
        sortedObj[key] = obj[key]
    })

    return sortedObj
}

export function trans_key(
    obj, map, drop = false, round = false,
    percentage = []) {
    const newObj = {}
    for (let key in obj) {
        if (map[key]) {
            let value = obj[key]
            if (typeof value === 'number' && round) {
                value = Math.round(value * 100) / 100
            }

            if (percentage.includes(map[key])) {
                value = String(value * 100).substring(0, 5) + '%'
            }

            newObj[map[key]] = value
        } else if (!(drop)) {
            newObj[key] = obj[key]
        }
    }
    return sort_dict(newObj)
}

export var show_memory_usage = function() {
    var mem = process.memoryUsage()
    var format = function(bytes) {
        return (bytes/1024/1024).toFixed(2)+'MB'
    };
    console.log('Process1: heapTotal '+format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss))
}

export function back_server() {
    const hostname = location.hostname
    
    const serverMap = {
        'localhost': 'http://192.168.124.53:6080',
        
        '192.168.124.22': 'http://192.168.3.12:6080',
        // '192.168.124.22': 'http://192.168.124.53:6080',
        
        '192.168.3.12': 'http://192.168.3.12:6080',
        'oa.nsyy.com.cn': 'http://120.194.96.67:6080'
    }
    
    for (let ip of Object.keys(serverMap)) {
        if (hostname.includes(ip)) { 
            return serverMap[`${ip}`]
        }
    }
    return ''
}

export function gene_qrcode(qr_info, ref_ip, size) {
    let w = size; let h = size;
    let qr_id = document.getElementById(ref_ip)
    qr_id.innerHTML = ''
    qr = new qrcode(qr_id, {
        text: qr_info, widht: w, height: h,
        colorDark: '#000000', colorLight: '#ffffff',
    })
}

export function get_cache(type, key) {
    if (type == 'session') {
        return sessionStorage.getItem(key)
    } else if (type == 'local') {
        return localStorage.getitem(key)
    } else if (type == 'cookie') {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + key.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ))
        return matches ? decodeURIComponent(matches[1]) : null
    }
}