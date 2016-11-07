
export function extractImage(content){
  let results=[]
  const images = content.match(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g);
  if( Array.isArray(images) && images.length > 0){
    for(let i = 0; i < images.length; i++){
      const url = images[i].replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/,function ($1,m1,m2,m3,m4) {
        return m4 || '';
      });

      if(url !== ''){
        results.push({url:url})
      }
    }
  }

  return results;
} 