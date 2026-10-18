import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  'https://umooqsaxjouiiimqgrzs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtb29xc2F4am91aWlpbXFncnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyODc0MTgsImV4cCI6MjEwNzg2MzQxOH0.iuaQ6REOeCblEeazgym0LKT97eXGe-maefIno4KvvwU'
);
