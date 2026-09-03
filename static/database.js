console.log("THIS IS THE STATIC SCRIPT");
const SUPABASE_URL = "https://zkdogembgyxuyubeefbd.supabase.co"
const SUPABASE_KEY = "sb_publishable_CC418qRSwN8lxYI-DocPuQ_W0zptHCS"

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

async function getScores() {
    const { data, error } = await supabaseClient
        .from("scores")
        .select("*")
        .order("score", { ascending: false })
        .limit(10);

    console.log(data);
    console.log(error);
    return data;
}

getScores();

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

    console.log(data);
    console.log(error);

}