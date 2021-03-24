function can(str: string, no: number) {
    return parseInt(str.charAt(no));
}
function cas(str: string, no: number) {
    return str.charAt(no);
}

export default function checkResidentNo(rno: string) {
    rno = rno.replace("-", "");
    if(rno.length != 13) {
        return {
            success: false,
            error: "LENGTH_MISMATCH"
        };
    }
    let typeSex = can(rno, 0x6);
    let areaCode = cas(rno, 0x7)+cas(rno, 0x8);
    let userProvidedChecksum = can(rno, 0xC);
    let legitChecksum = (() => {
        let sum = 0;
        for(let i=0;i<12;i++) {
            let gop = (i>7)?i-6:i+2;
            sum += can(rno, i)*gop;
        }
        return (11 - (sum % 11) > 9) ? (11 - (sum % 11)) - 10 : 11 - (sum % 11);
    })();
    if(legitChecksum !== userProvidedChecksum) {
        return {
            success: false,
            error: "CHECKSUM_ERROR"
        };
    }
    let sex = typeSex % 2 ? "M" : "F";
    let century = 20;
    let type = "KOREAN_CITIZEN";
    if(typeSex > 0 && typeSex < 5) {
        century = typeSex < 3 ? 20 : 21;
    } else if (typeSex > 4 && typeSex < 9) {
        century = typeSex < 7 ? 20 : 21;
        type = (() => {
            switch (can(rno, 0xB)) {
                case 7:
                    return "COMPATRIOT";
                case 8:
                    return "KOREAN_OVERSEAS"
                default:
                    return "FOREIGNER";
            }
        })();
    } else {
        century = 19;
    }
    let birthYear = (century-1).toString()+cas(rno, 0x0)+cas(rno, 0x1);
    let birthMonth = cas(rno,0x2)+cas(rno,0x3);
    let birth = new Date(birthYear+"-"+birthMonth+"-"+cas(rno,0x4)+cas(rno,0x5));
    let approxArea = "UNKNOWN";
    if(!(parseInt(birthYear) > 2020 || (parseInt(birthYear) == 2020 && parseInt(birthMonth) >= 10))) {
        if(parseInt(areaCode) >= 0 && parseInt(areaCode) <= 8)
            approxArea = "SEOUL";
        if(parseInt(areaCode) >= 9 && parseInt(areaCode) <= 12)
            approxArea = "BUSAN";
        if(parseInt(areaCode) >= 13 && parseInt(areaCode) <= 15)
            approxArea = "INCHEON";
        if(parseInt(areaCode) >= 16 && parseInt(areaCode) <= 18)
            approxArea = "GYEONGGI_MAJOR";
        if(parseInt(areaCode) >= 19 && parseInt(areaCode) <= 25)
            approxArea = "GYEONGGI_NONMAJOR";
        if(parseInt(areaCode) >= 26 && parseInt(areaCode) <= 34)
            approxArea = "GANGWON";
        if(parseInt(areaCode) >= 35 && parseInt(areaCode) <= 39)
            approxArea = "CHUNGBUK";
        if(parseInt(areaCode) == 40)
            approxArea = "DAEJEON";
        if(parseInt(areaCode) >= 41 && parseInt(areaCode) <= 47)
            approxArea = "CHUNGNAM";
        if(parseInt(areaCode) >= 48 && parseInt(areaCode) <= 54)
            approxArea = "JEONBUK";
        if(parseInt(areaCode) >= 55 && parseInt(areaCode) <= 64)
            approxArea = "JEONNAM";
        if(parseInt(areaCode) >= 79 && parseInt(areaCode) <= 75
        ||(parseInt(areaCode) >= 77 && parseInt(areaCode) <= 81))
            approxArea = "GYEONGBUK";
        if(parseInt(areaCode) >= 82 && parseInt(areaCode) <= 84
        ||(parseInt(areaCode) >= 86 && parseInt(areaCode) <= 93))
            approxArea = "GYEONGBUK";
        if(parseInt(areaCode) >= 94 && parseInt(areaCode) <= 95)
            approxArea = "JEJU";

        /* EXCEPTION */
        if(parseInt(areaCode) >= 67 && parseInt(areaCode) <= 69
        || parseInt(areaCode) == 76)
            approxArea = "DAEGU"
        if(parseInt(areaCode) == 65 || parseInt(areaCode) == 66)
            approxArea = "GWANGJU"
        if(parseInt(areaCode) == 85)
            approxArea = "ULSAN"
        if(parseInt(areaCode) == 44 || parseInt(areaCode) == 49
        || parseInt(areaCode) == 96)
            approxArea = "SEJONG";
        if(parseInt(areaCode) == 11)
            approxArea = "BUSAN_OR_SEJONG";
    }
    return {
        success: true,
        birth,
        sex,
        type,
        approxArea
    }
}

// Test
// 012345-6789ABC
// /(?:[0-9]{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[1,2][0-9]|3[0,1]))-[1-4][0-9]{6}/