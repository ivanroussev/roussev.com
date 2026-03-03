FROM nginx:alpine

COPY index.html style.css script.js ivan-pfp.jpg /usr/share/nginx/html/

EXPOSE 80
