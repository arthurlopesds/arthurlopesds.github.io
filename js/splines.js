// const math = require('mathjs')

const sortArray = (arr1, arr2) => {
    var list = [];
    for (var j = 0; j < arr1.length; j++) 
        list.push({'array1': arr1[j], 'array2': arr2[j]});

    list.sort(function(a, b) {
        return ((a.array1 < b.array1) ? -1 : ((a.array1 == b.array1) ? 0 : 1));
    });

    for (var k = 0; k < list.length; k++) {
        arr1[k] = list[k].array1;
        arr2[k] = list[k].array2;
    }
}

// Encontrar as constantes a, b, c, d para montar a função spline
// Sn(x) = an + bn*(x - xn) + cn*(x - xn)^2 + dn*(x - xn)^3
const findSplineConstants = (x, y) => {
    /**
     * x -> valores de x da tabela
     * y -> valores de y da tabela
     */
    sortArray(x, y)
    var xSize = x.length
    var spline = []
    var a = y
    var b = new Array(xSize).fill(0)
    var c = new Array(xSize).fill(0)
    var d = new Array(xSize).fill(0)
    var alpha = new Array(xSize).fill(0)
    var h = []
    var l = []
    var u = []
    var z = []   
    l.push(1)
    u.push(0)
    z.push(0)
    
    for(let i = 0; i < (xSize - 1); i++) {
        h.push(x[i+1] - x[i])
        if(i > 0) {
            alpha[i] = (3 * (a[i+1] - a[i]) / h[i]) - (3 * (a[i] - a[i-1]) / h[i-1])
            l.push( 2 * (x[i+1] - x[i-1]) - h[i-1] * u[i-1] )
            u.push( h[i] / l[i] )
            z.push( (alpha[i] - h[i-1] * z[i-1]) / l[i] )
        }
    }
    l.push(1)
    z.push(0)

    for(let i = xSize - 2; i >= 0; i--){
        c[i] = z[i] - u[i] * c[i+1]
        b[i] = ((a[i+1] - a[i]) / h[i]) - (h[i] * (c[i+1] + 2 * c[i]) / 3)
        d[i] = (c[i+1] - c[i]) / (3 * h[i])
    }

    for(let i = 0; i < xSize - 1; i++) {
        spline.push({a: a[i], b: b[i], c: c[i], d: d[i]})
    }
    // console.log(spline)
    return spline
}

// Determina os valores de x em cada intervalo
// Ex.: valores desse intervalo [x0, x1]
const getXInterval = x => {
    var interval = ((Math.abs(x[x.length - 1]) - Math.abs(x[0])) * 0.01)
    var valuesInterval = math.range(x[0], x[x.length-1], interval)
    return valuesInterval._data
}


// Sn(x) = an + bn*(x - xn) + cn*(x - xn)^2 + dn*(x - xn)^3
const getYInterpolated = (xn, xInterval, splineConstants) => {
    return splineConstants.a + (splineConstants.b * (xInterval - xn)) 
        + (splineConstants.c * math.pow((xInterval - xn), 2) + splineConstants.d * math.pow((xInterval - xn), 3))
}

const getPolynomialFunction = splineConstants => {
    var polyFunction = []
    for(let i = 0; i < splineConstants.length; i++) {
        polyFunction.push(`S${i}(x) = 
                ${splineConstants[i].a.toFixed(6)} + 
                ${splineConstants[i].b.toFixed(6)}*(x - x${i}) + 
                ${splineConstants[i].c.toFixed(6)}(x - x${i})^2 + 
                ${splineConstants[i].d.toFixed(6)}(x - x${i})^3`)
    }
    return polyFunction
}

// Verifica as condições
// Sj(xj) = f(xj)
// Sj(xj+1) = f(xj+1)
// Sj+1(xj+1) = Sj(xj+1)
const verifyConditions = (x, y, splineConstants) => {
    for(let i = 0; i < (splineConstants.length - 1); i++) {
        let sjxj = getYInterpolated(x[i], x[i], splineConstants[i])
        let sjxj1 = getYInterpolated(x[i], x[i+1], splineConstants[i])
        let sj1xj1 = getYInterpolated(x[i+1], x[i+1], splineConstants[i+1])

        if((sjxj.toFixed(6) != y[i].toFixed(6)) || (sjxj1.toFixed(6) != y[i+1].toFixed(6))
            || (sj1xj1.toFixed(6) != sjxj1.toFixed(6))) {
                console.log("Não atendeu as condições")
                return false
        }
        
        /*console.log(`S${i}(x${i}) = ${sjxj.toFixed(6)}`)
        console.log(`F(${i}) = ${y[i]}`)
        console.log(sjxj.toFixed(6) != y[i].toFixed(6))
        console.log(`S${i}(x${i+1}) = ${sjxj1.toFixed(6)}`)
        console.log(`F(${i+1}) = ${y[i+1]}`)
        console.log(sjxj1.toFixed(6) != y[i+1].toFixed(6))
        console.log(`S${i+1}(x${i+1}) = ${sj1xj1}`)
        console.log("Terminou")*/
        return true
    }
}

const buildSpline = (x, y) => {
    var splineConstants = findSplineConstants(x, y)
    var yInterpolated = []
    var xInterval = getXInterval(x)
    xInterval.push(x[x.length-1])
    var polynomialFunction = getPolynomialFunction(splineConstants)
    let i = 0

    if(!verifyConditions(x, y, splineConstants))
        return null
    
    for(let j = 0; j < xInterval.length; j++) {
        if(xInterval[j] > x[i+1])
            i++
        
        yInterpolated.push(getYInterpolated(x[i], xInterval[j], splineConstants[i]))
    }

    return {x, y, xInterval, yInterpolated, polynomialFunction}
}

// var x = [0.1,
//     0.5,
//     0.9,
//     1.3,
//     1.7]

// var y = [-2.3026,
//     -0.69315,
//     -0.10536,
//     0.26236,
//     0.53063]
// getXInterval(x)
// findSplineConstants(x, y)
// var t = buildSpline(x, y)
// console.log(t)