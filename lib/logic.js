'use strict';
/**
 * Write your transction processor functions here
 *  @param {org.distro.biz.createInvoice} tx 
 *  @transaction
 */
function createInvoice(tx){
    var factory = getFactory();

    var invoice = factory.newResource("org.distro.biz","Invoice",tx.id);
    invoice.amount = tx.amount;
    invoice.dueDate = tx.dueDate;
    invoice.createdDate = tx.createdDate;
    invoice.description1= tx.description1;
    invoice.description2 = tx.description2;
    invoice.buyer = tx.buyer;
    invoice.status = "CREATED";
    invoice.seller = tx.seller;

    return getAssetRegistry(invoice.getFullyQualifiedType()).then(
        function(invoiceRegistry){
            return invoiceRegistry.add(invoice);
        }
    ).then(
        function(){
            var event = factory.newEvent("org.distro.biz","InvoiceCreated");
            event.invoice = invoice;
            emit(event);
        }

    );



}



/**
 * Write your transction processor functions here
 *  @param {org.distro.biz.acceptInvoice} tx 
 *  @transaction
 */
function acceptInvoice(tx){
    
    return getAssetRegistry(tx.invoice.getFullyQualifiedType()).then(
        function(invoiceRegistry){
            console.log("##### Fetched Invoice Registry");
                return invoiceRegistry.get(tx.invoice.getIdentifier()).then(
                function(invoice){
                    console.log("#####"+getCurrentParticipant()+"####"+invoice.seller.getIdentifier());
                    invoice.status = "ACCEPTED";
                    invoiceRegistry.update(invoice);
                }
            );

        }

    ).then(
        function(){
            
            var event = getFactory().newEvent("org.distro.biz","InvoiceAccepted");
            event.invoice = tx.invoice;
            emit(event);
        }

    );
}

// /**
//  * Write your transction processor functions here
//  *  @param {org.distro.biz.createLoan} tx 
//  *  @transaction
//  */
// function createLoan(tx){
//     var factory = getFactory();
//     var loan = factory.newResource("org.distro.biz","Loan",tx.id);
//     loan.dueDate = tx.dueDate;
//     loan.createdDate = tx.createdDate;
//     loan.amount = tx.amount;
//     loan.duration = tx.duration;
//     loan.invoice = tx.invoice;
//     loan.distributor = tx.distributor;
//     loan.retailer = tx.retailer;
//     loan.status = "CREATED";

    
//     if (tx.amount <= 0 || tx.duration <= 0 ){
//         throw new Error("Amount and duration should be greater than zero");
//     }

//     if (tx.invoice.status == "CREATED" ){
//         throw new Error("Invoice has to be accepted before applying for loan");
//     }

//     if (tx.invoice.status == "LOAN_APPLIED" ){
//         throw new Error("Loan has already been applied for this invoice");
//     }
    

//     return getAssetRegistry(loan.getFullyQualifiedType()).then(
//         function(loanRegistry){
//              loanRegistry.add(loan);
//         }).then(
//             function(){
//                 getAssetRegistry(tx.invoice.getFullyQualifiedType()).then(
//                     function(invoiceRegistry){
//                         console.log("##### Fetched Invoice Registry");
//                             invoiceRegistry.get(tx.invoice.getIdentifier()).then(
//                             function(invoice){
//                                 console.log("#####"+getCurrentParticipant()+"####"+invoice.retailer.getIdentifier());
//                                 invoice.status = "LOAN_APPLIED";
//                                 invoiceRegistry.update(invoice);
//                             }
//                         );
            
//                     }
//             )}).then(

//             function(){
//                 var event = factory.newEvent("org.distro.biz","LoanCreated");
//                 event.loan = loan;
//                 emit(event);
//             }
    
//         );
    
// }

// /**
//  * Write your transction processor functions here
//  *  @param {org.distro.biz.verifyLoan} tx 
//  *  @transaction
//  */
// function verifyLoan(tx){
//     return getAssetRegistry(tx.loan.getFullyQualifiedType()).then(
//         function(loanRegistry){
//              loanRegistry.get(tx.loan.id).then(
//                  function (loan){
//                      loan.status = "VERIFIED";
//                      loanRegistry.update(loan)
//                  }
//              );
//         }).then(

//             function(){
//                 var event = getFactory().newEvent("org.distro.biz","LoanVerified");
//                 event.loan = tx.loan;
//                 emit(event);
//             }
    
//         );
// }


// /**
//  * Write your transction processor functions here
//  *  @param {org.distro.biz.applyLoan} tx 
//  *  @transaction
//  */
// function applyLoan(tx){
//     return getAssetRegistry(tx.loan.getFullyQualifiedType()).then(
//         function(loanRegistry){
//              loanRegistry.get(tx.loan.id).then(
//                  function (loan){
//                      loan.status = "APPLIED";
//                      loan.bank = tx.bank;
//                      loanRegistry.update(loan)
//                  }
//              );
//         }).then(

//             function(){
//                 var event = getFactory().newEvent("org.distro.biz","LoanApplied");
//                 event.loan = tx.loan;
//                 emit(event);
//             }
    
//         );
// }

// /**
//  * Write your transction processor functions here
//  *  @param {org.distro.biz.approveLoan} tx 
//  *  @transaction
//  */
// function approveLoan(tx){
//     return getAssetRegistry(tx.loan.getFullyQualifiedType()).then(
//         function(loanRegistry){
//              loanRegistry.get(tx.loan.id).then(
//                  function (loan){
//                      loan.status = "APPROVED";
//                      loanRegistry.update(loan)
//                  }
//              );
//         }).then(

//             function(){
//                 var event = getFactory().newEvent("org.distro.biz","LoanApproved");
//                 event.loan = tx.loan;
//                 emit(event);
//             }
    
//         );
// }


// /**
//  * Write your transction processor functions here
//  *  @param {org.distro.biz.repayLoan} tx 
//  *  @transaction
//  */
// function repayLoan(tx){
//     return getAssetRegistry(tx.loan.getFullyQualifiedType()).then(
//         function(loanRegistry){
//              loanRegistry.get(tx.loan.id).then(
//                  function (loan){
//                      loan.status = "SETTLED";
//                      loanRegistry.update(loan)
//                  }
//              );
//         });
// }

/**
 * Write your transction processor functions here
 *  @param {org.distro.biz.settleInvoice} tx 
 *  @transaction
 */
function settleInvoice(tx){
    return getAssetRegistry(tx.invoice.getFullyQualifiedType()).then(
        function(invoiceRegistry){
            invoiceRegistry.get(tx.invoice.id).then(
                 function (invoice){
                    invoice.status = "SETTLED";
                    invoiceRegistry.update(invoice);
                 }
             );
        });
}
