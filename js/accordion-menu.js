const accordionsMenu = $('.accordion-menu');

if (accordionsMenu.length > 0) {
  accordionsMenu.each(function() {
    const accordion = $(this);
    accordion.on('change', 'input[type="checkbox"]', function() {
      var checkbox = $(this);
      console.log(checkbox.prop('checked'));
      console.log(checkbox.siblings('ul'));
      (checkbox.prop('checked')) 
        ? checkbox.siblings('ul').attr('style', 'display:none;').slideDown(300) 
        : checkbox.siblings('ul').attr('style', 'display:block;').slideUp(300);
    });
  });
}