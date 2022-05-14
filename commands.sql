CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  author text,
  url text NOT NULL,
  title text NOT NULL,
  likes integer DEFAULT 0
);

INSERT INTO blogs (author, url, title, likes) VALUES
  ('Edsger W. Dijkstra', 'http://google.com', 'How to win the game', 5),
  ('Joe Moe', 'https://google.com/', 'How to code', 10);