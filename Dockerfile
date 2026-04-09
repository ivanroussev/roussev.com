FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf \
    && rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY index.html projects.html blogs.html style.css script.js build-info.json robots.txt sitemap.xml ivan-pfp.jpg favicon.svg cncf-blog.png /usr/share/nginx/html/
COPY icons/ /usr/share/nginx/html/icons/

RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
