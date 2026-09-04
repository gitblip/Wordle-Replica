/* ===================================================
   database.js — Supabase connection for the `scores` table
   Columns: id, player, score, created_at (db default)
   =================================================== */

const SUPABASE_URL = "https://zkdogembgyxuyubeefbd.supabase.co"
const SUPABASE_KEY = "sb_publishable_CC418qRSwN8lxYI-DocPuQ_W0zptHCS"

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// Top 10 scores, highest first
async function getScores() {
    const { data, error } = await supabaseClient
        .from("scores")
        .select("*")
        .order("score", { ascending: false })
        .limit(10);

    // Throw so callers can tell "no scores yet" apart from "request failed"
    if (error) throw error;

    return data || [];
}

async function submitScore(player, score) {
    const { data, error } = await supabaseClient
        .from("scores")
        .insert([
            {
                player: player,
                score: score
            }
        ])
        .select();

    if (error) throw error;

    return data;
}
