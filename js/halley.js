const findVariable = (f) => {
    // Expressão regular para isolar a variável da função
    let regexVar = /([a-zA-Z][\w]*) ?([\+\-\/\*\^]|$|\))/

    // tentativa de identificar a variável
    let variable = regexVar.exec(f)

    // Caso não encontre a variável
    if (!variable) {
        console.log('Não foi possível encontrar a variável!')
    }

    // Remove símbolos inválidos da variável
    variable = variable[0].replace(/\W+/, '')
    return variable
}

const stringToFunction = (f, variable) => {

    // Adicionar a chamada do método correspondente de Math
    f = f.replace(/(cos|sin|tan|exp|log|log10|log2)/g, 'Math.$1')
    f = f.replace(/\^/g, '**')

    // Criando uma arrow function a partir da string
    f = eval('(' + variable + ') => ' + f)

    // Verficar se a função foi escrita corretamente
    // try {
    //     f(1)
    // } catch (Error) {
    //     console.log("A função não está correta!");
    //     return;
    // }

    return f
}

/*
    f -> função
    xo -> valor inicial
    tol -> erro tolerado
    iter -> quantidade de iterações
*/
const halleyMethod = (f, x0, tol, iter) => {

    /*
        i -> contador de iterações realizadas
        xi -> valor aproximado da função a cada iteração
        err -> erro absoluto após cada iteração
        variable -> variável da função
        der1 -> derivada primeira de f
        der2 -> derivada segunda de f
    */

    let xi, i = 0
    let xValues = []
    let yValues = []
    let err = tol + 0.1 //Inicializa com esse valor para entrar no loop
    let variable = findVariable(f)

    // Encontrando derivada primeira e segunda da função
    let der1 = math.derivative(f, variable).toString()
    let der2 = math.derivative(der1, variable).toString()
    
    // Converte o erro para valor
    tol = parseFloat(tol).toFixed(20);
    
    // Converte as funções de String para Função JS
    f = stringToFunction(f, variable)
    der1 = stringToFunction(der1, variable)
    der2 = stringToFunction(der2, variable)

    xValues.push(x0)
    yValues.push(f(x0))

    while((i < iter) && (err > tol)) {
        xi = x0 - (2 * f(x0) * der1(x0)) / (2 * (der1(x0) * der1(x0)) - (f(x0) * der2(x0)))
        err = Math.abs((xi - x0)/xi)
        xValues.push(xi)
        yValues.push(f(xi))
        x0 = xi
        i++
    }

    return ( { xi: xi, xValues: xValues, yValues: yValues } )
}