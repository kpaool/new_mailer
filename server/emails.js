export const emailVariations = [
    {
      subject: "Request for Quotation – {{product}}",
      body: `Dear {{receiver}},\n
  
  I hope you’re doing well.
  
  The Department of {{department}} is inviting service providers and suppliers to submit quotations for the supply and delivery of {{product}}.
  
  This is an open request, meaning you do not need to specialize in this product—you are welcome to source it from a supplier and provide us with your company’s pricing.
  
  If you’re interested, please send us your quotation at your earliest convenience, as this request is urgent. Should you have any questions, feel free to reach out.
  
  \n{{end_credits}}
  `
    },
    {
      subject: "RFQ for {{product}}",
      body: `Dear {{receiver}},
  
  I are reaching out to request a quotation for the supply and delivery of {{product}} on behalf of the Department of {{department}}.
  
  This request is open to all service providers, meaning you don’t need to specialize in this product—you may source it from a supplier and submit a quotation based on your pricing.
  
  As this is an request, we’d appreciate receiving your quotation as soon as possible. Please let us know if you have any questions.
  
   {{end_credits}}`
    },
    {
      subject: "Request for Quotation – {{product}}",
      body: `Dear {{receiver}},
  
  I hope this email finds you well.
  
  We are inviting quotations for the supply and delivery of {{product}} for the Department of {{department}}. This request is open, so you don’t need to specialize in this product—you can source it from a supplier and provide us with your pricing.
  
  If you are interested, kindly send your quotation at your earliest convenience, as this request is urgent. Should you need any further details, feel free to contact us.
  
   {{end_credits}}`
    },
    {
      subject: "Quotation Request – {{product}}",
      body: `Dear {{receiver}},
  
  The Department of {{department}} is currently seeking quotations for the supply and delivery of {{product}}.
  
  This request is open to all service providers, meaning you are not required to specialize in this product—you may source it from a supplier and submit a quotation based on your pricing.
  
  If you are able to assist, please send us your quotation as soon as possible, as this is an urgent request. Feel free to reach out if you have any questions.
  
   {{end_credits}}`
    }
  ];
  
//   console.log(emailVariations);
  