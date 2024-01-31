const confirm_temp = (name, email, sub, msg) => {
    return `<div>
                <main>
                     <div>
                         <h1>Hello ${name}, your email id is ${email}</h1>
                         <h3> ${ sub } </h3>
                         <p>
                           <strong>
                              ${msg}
                           </strong>
                         </p>

                         <h3>Thanks,</h3>
                         <h4>Team File Manager.</h4>
                     </div>
                </main>
            </div>`
}

module.exports = confirm_temp