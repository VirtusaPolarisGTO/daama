'use strict';
/**
 * Create asset Invoice transction processor function
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
 * Accept Invoice processor functions
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
