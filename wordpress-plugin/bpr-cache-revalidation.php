/**
 * BPR Cache Revalidation Plugin
 * 
 * Automatically clears Next.js cache when WordPress content is updated
 * 
 * Installation:
 * 1. Save this file as: wp-content/plugins/bpr-cache-revalidation.php
 * 2. Update WEBHOOK_URL and WEBHOOK_SECRET constants below
 * 3. Activate the plugin in WordPress admin
 * 
 * Or copy this code to your theme's functions.php
 */

<?php
/*
Plugin Name: BPR Cache Revalidation
Plugin URI: https://brownpoliticalreview.org
Description: Automatically clears Next.js cache when WordPress content is updated
Version: 1.0.0
Author: BPR Tech Team
*/

// Configuration - UPDATE THESE VALUES
define('BPR_WEBHOOK_URL', 'https://your-domain.com/api/revalidate');
define('BPR_WEBHOOK_SECRET', 'your-secret-token-here');

/**
 * Trigger cache revalidation
 */
function bpr_revalidate_cache($type = 'all') {
    $url = BPR_WEBHOOK_URL . '?secret=' . BPR_WEBHOOK_SECRET . '&type=' . $type;
    
    $response = wp_remote_post($url, array(
        'timeout' => 5,
        'blocking' => false, // Don't wait for response
        'headers' => array(
            'Content-Type' => 'application/json',
        ),
    ));
    
    if (is_wp_error($response)) {
        error_log('BPR Cache Revalidation Error: ' . $response->get_error_message());
        return false;
    }
    
    error_log('BPR Cache Revalidation: Triggered for type: ' . $type);
    return true;
}

/**
 * Revalidate cache when posts are created/updated
 */
function bpr_revalidate_on_post_update($post_id, $post, $update) {
    // Skip autosaves
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    // Skip revisions
    if (wp_is_post_revision($post_id)) {
        return;
    }
    
    // Only for published posts
    if ($post->post_status !== 'publish') {
        return;
    }
    
    // Trigger revalidation
    bpr_revalidate_cache('posts');
}
add_action('save_post', 'bpr_revalidate_on_post_update', 10, 3);

/**
 * Revalidate cache when posts are deleted
 */
function bpr_revalidate_on_post_delete($post_id) {
    // Skip revisions
    if (wp_is_post_revision($post_id)) {
        return;
    }
    
    bpr_revalidate_cache('posts');
}
add_action('delete_post', 'bpr_revalidate_on_post_delete');

/**
 * Revalidate cache when categories are created/updated/deleted
 */
function bpr_revalidate_on_category_change($term_id, $tt_id, $taxonomy) {
    if ($taxonomy === 'category') {
        bpr_revalidate_cache('categories');
    }
}
add_action('create_term', 'bpr_revalidate_on_category_change', 10, 3);
add_action('edit_term', 'bpr_revalidate_on_category_change', 10, 3);
add_action('delete_term', 'bpr_revalidate_on_category_change', 10, 3);

/**
 * Revalidate cache when tags are created/updated/deleted
 */
function bpr_revalidate_on_tag_change($term_id, $tt_id, $taxonomy) {
    if ($taxonomy === 'post_tag') {
        bpr_revalidate_cache('tags');
    }
}
add_action('create_term', 'bpr_revalidate_on_tag_change', 10, 3);
add_action('edit_term', 'bpr_revalidate_on_tag_change', 10, 3);
add_action('delete_term', 'bpr_revalidate_on_tag_change', 10, 3);

/**
 * Revalidate cache when media is uploaded/updated/deleted
 */
function bpr_revalidate_on_media_change($attachment_id) {
    bpr_revalidate_cache('media');
}
add_action('add_attachment', 'bpr_revalidate_on_media_change');
add_action('edit_attachment', 'bpr_revalidate_on_media_change');
add_action('delete_attachment', 'bpr_revalidate_on_media_change');

/**
 * Add admin notice to configure webhook
 */
function bpr_admin_notice() {
    if (BPR_WEBHOOK_URL === 'https://your-domain.com/api/revalidate' || 
        BPR_WEBHOOK_SECRET === 'your-secret-token-here') {
        ?>
        <div class="notice notice-warning">
            <p>
                <strong>BPR Cache Revalidation:</strong> 
                Please configure your webhook URL and secret in 
                <code>wp-content/plugins/bpr-cache-revalidation.php</code>
            </p>
        </div>
        <?php
    }
}
add_action('admin_notices', 'bpr_admin_notice');

/**
 * Add settings page (optional)
 */
function bpr_add_admin_menu() {
    add_options_page(
        'BPR Cache Revalidation',
        'BPR Cache',
        'manage_options',
        'bpr-cache-revalidation',
        'bpr_settings_page'
    );
}
add_action('admin_menu', 'bpr_add_admin_menu');

function bpr_settings_page() {
    ?>
    <div class="wrap">
        <h1>BPR Cache Revalidation</h1>
        <p>Webhook URL: <code><?php echo esc_html(BPR_WEBHOOK_URL); ?></code></p>
        <p>Secret: <code><?php echo esc_html(substr(BPR_WEBHOOK_SECRET, 0, 10)); ?>...</code></p>
        
        <h2>Manual Cache Clear</h2>
        <form method="post">
            <?php wp_nonce_field('bpr_manual_revalidate'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row">Clear Cache Type:</th>
                    <td>
                        <select name="cache_type">
                            <option value="all">All</option>
                            <option value="posts">Posts</option>
                            <option value="categories">Categories</option>
                            <option value="tags">Tags</option>
                            <option value="media">Media</option>
                        </select>
                    </td>
                </tr>
            </table>
            <?php submit_button('Clear Cache'); ?>
        </form>
        
        <?php
        if (isset($_POST['cache_type']) && check_admin_referer('bpr_manual_revalidate')) {
            $type = sanitize_text_field($_POST['cache_type']);
            $result = bpr_revalidate_cache($type);
            
            if ($result) {
                echo '<div class="notice notice-success"><p>Cache revalidation triggered for: ' . esc_html($type) . '</p></div>';
            } else {
                echo '<div class="notice notice-error"><p>Failed to trigger cache revalidation</p></div>';
            }
        }
        ?>
        
        <h2>Recent Activity</h2>
        <p>Check your server error logs for revalidation activity.</p>
    </div>
    <?php
}
?>
