-- Migration: Dashboard-Detailansicht pro Material
-- In Supabase SQL-Editor ausführen.

alter table materials add column if not exists exercise_id text;
alter table materials add column if not exists total_tasks int; -- null/1 = Einzelaufgabe, >1 = Mehrfachaufgabe

-- Bestehende 3 Übungen verknüpfen (Werte an deine tatsächlichen file_path-Einträge anpassen,
-- falls sie anders lauten als unten angenommen):

update materials set exercise_id = 'bruchrechnen-01', total_tasks = null
  where file_path = 'uebungen/bruchrechnen-01.html';

update materials set exercise_id = 'bruchrechnen-02-multi', total_tasks = 3
  where file_path = 'uebungen/bruchrechnen-02-multi.html';

update materials set exercise_id = 'lineare-gleichungen-01', total_tasks = null
  where file_path = 'uebungen/lineare-gleichungen-01.html';

-- Für jedes künftige neue Material einfach exercise_id (muss exakt der EXERCISE_ID
-- im HTML-Code der Übung entsprechen) und ggf. total_tasks mit angeben.
