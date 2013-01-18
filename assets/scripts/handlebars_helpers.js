Handlebars.registerHelper( 'time', function( timestamp ){

	var datetime = new Date( timestamp );
	var hour = datetime.getHours();
	var hour_12 = hour % 12 || 12;
	var minute = datetime.getMinutes().toString();
	if( minute.length === 1 ) minute = '0'+ minute;
	var second = datetime.getSeconds();
	var am_pm = ( hour < 12 )? 'AM': 'PM';

	return new Handlebars.SafeString( hour_12 +':'+ minute +' '+ am_pm );

});

Handlebars.registerHelper( 'breaklines', function( text ){

    text = Handlebars.Utils.escapeExpression( text );
    text = text.toString();
    text = text.replace( /(\r\n|\n|\r)/gm, '<br />' );
    return new Handlebars.SafeString( text );

});