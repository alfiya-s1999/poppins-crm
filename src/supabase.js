import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lvhxsqoioihqqrmronyn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2aHhzcW9pb2locXFybXJvbnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NTI5NDksImV4cCI6MjA5MzIyODk0OX0.fJxsjsvKWeHL3knNtNNPJbQA4U6afQWvlhce48EIkHU'

export const supabase = createClient(supabaseUrl, supabaseKey)
